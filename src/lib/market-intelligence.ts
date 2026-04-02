// src/lib/market-intelligence.ts
// Pure utility functions for price analytics:
//   - trend detection
//   - overpricing detection
//   - confidence scoring
//   - anomaly detection hook
// All functions are pure (no DB calls) and unit-testable.

// ─── Types ────────────────────────────────────────────────────────────────────

export type Trend = "UP" | "DOWN" | "STABLE";

export interface PriceSnapshot {
  priceKes: number;
  recordedAt: Date;
}

export interface PriceWithRange {
  priceKes: number;
  priceLow:  number | null;
  priceHigh: number | null;
}

export interface OverpricingResult {
  isOverpriced: boolean;
  /** Percentage above the high range, e.g. 45 means 45% over market high */
  percentageOver: number | null;
  /** Human-readable flag message, null if not overpriced */
  flag: string | null;
}

export interface ConfidenceResult {
  score: number;       // 0–100
  label: "High" | "Medium" | "Low";
  reason: string;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  zScore: number | null;
  direction: "spike" | "drop" | null;
}

// ─── Trend detection ──────────────────────────────────────────────────────────

/**
 * Compares two consecutive prices and returns a trend.
 * A change of < 2% is considered STABLE to avoid noise.
 */
export function detectTrend(
  previousKes: number,
  currentKes: number,
  thresholdPct = 2,
): Trend {
  if (previousKes <= 0) return "STABLE";
  const changePct = ((currentKes - previousKes) / previousKes) * 100;
  if (changePct > thresholdPct)  return "UP";
  if (changePct < -thresholdPct) return "DOWN";
  return "STABLE";
}

/**
 * Infers trend from a time-series of snapshots (most recent last).
 * Uses linear regression slope direction for robustness against noise.
 * Requires at least 2 data points; returns STABLE with fewer.
 */
export function detectTrendFromSeries(snapshots: PriceSnapshot[]): Trend {
  if (snapshots.length < 2) return "STABLE";

  const sorted = [...snapshots].sort(
    (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()
  );

  // Simple linear regression on (time_index, price)
  const n = sorted.length;
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map(s => s.priceKes);

  const sumX  = xs.reduce((a, b) => a + b, 0);
  const sumY  = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Normalise slope against the average price
  const avgPrice = sumY / n;
  const normSlope = avgPrice > 0 ? (slope / avgPrice) * 100 : 0;

  if (normSlope > 1.5)  return "UP";
  if (normSlope < -1.5) return "DOWN";
  return "STABLE";
}

// ─── Overpricing detection ────────────────────────────────────────────────────

const OVERPRICING_THRESHOLD = 0.30; // 30% above high range = red flag

/**
 * Checks if a quoted or invoiced price is significantly above market.
 *
 * @param quotedPrice   The contractor's quoted price
 * @param marketData    The verified market price with optional range
 * @param threshold     Fraction above priceHigh to flag (default 0.30 = 30%)
 */
export function detectOverpricing(
  quotedPrice: number,
  marketData: PriceWithRange,
  threshold = OVERPRICING_THRESHOLD,
): OverpricingResult {
  // Use priceHigh as the upper bound if available, otherwise priceKes
  const ceiling = marketData.priceHigh ?? marketData.priceKes;

  if (quotedPrice <= ceiling) {
    return { isOverpriced: false, percentageOver: null, flag: null };
  }

  const percentageOver = ((quotedPrice - ceiling) / ceiling) * 100;

  if (percentageOver < threshold * 100) {
    return { isOverpriced: false, percentageOver: Math.round(percentageOver), flag: null };
  }

  return {
    isOverpriced: true,
    percentageOver: Math.round(percentageOver),
    flag: `Price is ${Math.round(percentageOver)}% above verified market high (KES ${ceiling.toLocaleString()}). Request itemised breakdown.`,
  };
}

/**
 * Batch overpricing check — returns only the flagged items.
 */
export function scanForOverpricing(
  quotedPrices: Array<{ name: string; quoted: number; market: PriceWithRange }>,
  threshold = OVERPRICING_THRESHOLD,
): Array<{ name: string; result: OverpricingResult }> {
  return quotedPrices
    .map(({ name, quoted, market }) => ({
      name,
      result: detectOverpricing(quoted, market, threshold),
    }))
    .filter(({ result }) => result.isOverpriced);
}

// ─── Confidence scoring ───────────────────────────────────────────────────────

/**
 * Scores data confidence based on:
 *  - Number of price sources
 *  - Whether a verified range exists
 *  - How recent the data is
 */
export function scoreConfidence(params: {
  sourceCount:  number;
  hasRange:     boolean;
  updatedAt:    Date;
}): ConfidenceResult {
  const { sourceCount, hasRange, updatedAt } = params;
  let score = 0;

  // Source count (0–50 points)
  score += Math.min(sourceCount * 15, 50);

  // Has verified range (0–25 points)
  if (hasRange) score += 25;

  // Recency (0–25 points)
  const ageMs = Date.now() - updatedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 7)  score += 25;
  else if (ageDays < 14) score += 15;
  else if (ageDays < 30) score += 8;
  else if (ageDays < 60) score += 3;

  const label: ConfidenceResult["label"] =
    score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";

  const reason =
    score >= 70
      ? `${sourceCount} source${sourceCount !== 1 ? "s" : ""}, range verified, recently updated`
      : score >= 40
      ? "Limited sources or stale data"
      : "Single source, no range, or outdated";

  return { score: Math.min(score, 100), label, reason };
}

// ─── Anomaly detection ────────────────────────────────────────────────────────

/**
 * Z-score anomaly detection.
 * Flags a price as anomalous if it is more than `zThreshold` standard
 * deviations from the mean of the comparison set.
 *
 * Useful for detecting data entry errors or extreme market outliers.
 *
 * @param price           The price to test
 * @param allPrices       Comparable prices (e.g. same material across counties)
 * @param zThreshold      Standard deviation threshold (default 2.5)
 */
export function detectAnomaly(
  price: number,
  allPrices: number[],
  zThreshold = 2.5,
): AnomalyResult {
  if (allPrices.length < 3) {
    return { isAnomaly: false, zScore: null, direction: null };
  }

  const mean = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
  const variance =
    allPrices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) /
    allPrices.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return { isAnomaly: false, zScore: 0, direction: null };

  const zScore = (price - mean) / stdDev;
  const isAnomaly = Math.abs(zScore) > zThreshold;

  return {
    isAnomaly,
    zScore: Math.round(zScore * 100) / 100,
    direction: isAnomaly ? (zScore > 0 ? "spike" : "drop") : null,
  };
}
