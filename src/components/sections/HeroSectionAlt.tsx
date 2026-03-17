// src/components/home/HeroSection.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// ─── Continent outlines as [lat, lng] degree pairs ───────────────────────────
// Simplified outlines — recognisable silhouettes without excess vertices.

const CONTINENTS: [number, number][][] = [
  // Africa
  [
    [37, -6],
    [37, 10],
    [33, 12],
    [32, 25],
    [30, 33],
    [22, 37],
    [16, 41],
    [12, 44],
    [8, 44],
    [4, 42],
    [0, 42],
    [-5, 40],
    [-10, 38],
    [-17, 36],
    [-25, 34],
    [-34, 26],
    [-34, 18],
    [-27, 15],
    [-17, 12],
    [-10, 14],
    [-5, 10],
    [0, 8],
    [4, 2],
    [5, -2],
    [5, -8],
    [8, -13],
    [11, -15],
    [15, -17],
    [20, -17],
    [25, -15],
    [33, -8],
    [37, -6],
  ],

  // Europe (mainland + Iberia + Scandinavia simplified)
  [
    [36, -9],
    [36, 5],
    [43, 5],
    [44, 8],
    [44, 14],
    [42, 18],
    [40, 20],
    [38, 22],
    [37, 26],
    [38, 27],
    [40, 27],
    [41, 30],
    [42, 28],
    [44, 30],
    [46, 30],
    [47, 24],
    [48, 18],
    [48, 15],
    [50, 15],
    [54, 18],
    [58, 25],
    [63, 28],
    [70, 26],
    [71, 22],
    [71, 15],
    [65, 14],
    [62, 6],
    [58, 5],
    [57, 8],
    [56, 10],
    [56, 12],
    [58, 12],
    [57, 10],
    [55, 8],
    [54, 8],
    [55, 10],
    [56, 10],
    [57, 10],
    [55, 8],
    [54, 8],
    [53, 6],
    [52, 4],
    [51, 2],
    [51, -1],
    [50, -5],
    [48, -5],
    [44, -2],
    [43, 3],
    [41, 3],
    [40, 0],
    [40, -4],
    [37, -9],
    [36, -9],
  ],

  // Asia (mainland — highly simplified)
  [
    [42, 27],
    [42, 36],
    [38, 36],
    [37, 36],
    [37, 42],
    [35, 36],
    [30, 33],
    [26, 37],
    [22, 40],
    [15, 42],
    [12, 44],
    [8, 44],
    [10, 50],
    [12, 52],
    [10, 58],
    [14, 74],
    [8, 77],
    [8, 80],
    [10, 80],
    [13, 80],
    [13, 78],
    [18, 73],
    [20, 73],
    [22, 68],
    [24, 68],
    [22, 60],
    [24, 57],
    [23, 57],
    [22, 60],
    [24, 66],
    [26, 66],
    [28, 64],
    [28, 50],
    [25, 52],
    [24, 56],
    [23, 58],
    [22, 60],
    [24, 68],
    [28, 68],
    [32, 74],
    [34, 74],
    [36, 72],
    [38, 68],
    [40, 60],
    [38, 50],
    [36, 46],
    [38, 44],
    [40, 50],
    [42, 52],
    [44, 50],
    [44, 42],
    [44, 36],
    [42, 27],
  ],

  // East/Southeast Asia + Japan simplified arc
  [
    [40, 120],
    [38, 122],
    [36, 122],
    [32, 120],
    [28, 120],
    [24, 118],
    [22, 114],
    [18, 110],
    [14, 108],
    [10, 104],
    [4, 104],
    [2, 104],
    [1, 104],
    [-1, 110],
    [-6, 107],
    [-8, 115],
    [-8, 125],
    [0, 128],
    [4, 118],
    [8, 98],
    [14, 100],
    [18, 102],
    [22, 106],
    [24, 112],
    [28, 116],
    [32, 118],
    [36, 120],
    [40, 120],
  ],

  // North America
  [
    [72, -78],
    [70, -85],
    [70, -100],
    [72, -120],
    [70, -140],
    [60, -142],
    [58, -140],
    [55, -130],
    [50, -128],
    [48, -124],
    [46, -124],
    [40, -124],
    [36, -122],
    [32, -118],
    [28, -115],
    [24, -110],
    [22, -106],
    [22, -98],
    [25, -97],
    [30, -97],
    [30, -90],
    [26, -82],
    [24, -82],
    [18, -88],
    [16, -90],
    [15, -85],
    [8, -77],
    [8, -75],
    [10, -73],
    [15, -69],
    [18, -67],
    [22, -72],
    [26, -78],
    [30, -81],
    [34, -76],
    [36, -76],
    [38, -75],
    [40, -74],
    [42, -70],
    [44, -68],
    [44, -64],
    [47, -53],
    [52, -56],
    [52, -64],
    [56, -64],
    [62, -68],
    [68, -68],
    [70, -64],
    [72, -78],
  ],

  // Greenland (simplified)
  [
    [76, -68],
    [72, -54],
    [68, -54],
    [64, -40],
    [64, -22],
    [68, -18],
    [72, -20],
    [76, -30],
    [80, -30],
    [84, -40],
    [84, -58],
    [80, -64],
    [76, -68],
  ],

  // South America
  [
    [12, -72],
    [10, -62],
    [8, -60],
    [4, -52],
    [0, -50],
    [-4, -36],
    [-8, -35],
    [-10, -37],
    [-14, -39],
    [-20, -40],
    [-24, -44],
    [-28, -50],
    [-32, -52],
    [-34, -54],
    [-38, -58],
    [-42, -64],
    [-46, -66],
    [-50, -68],
    [-52, -68],
    [-54, -66],
    [-56, -67],
    [-54, -64],
    [-50, -62],
    [-46, -56],
    [-40, -50],
    [-34, -52],
    [-30, -50],
    [-24, -44],
    [-20, -42],
    [-16, -40],
    [-10, -38],
    [-4, -36],
    [0, -50],
    [4, -52],
    [8, -60],
    [10, -62],
    [12, -72],
    [10, -75],
    [2, -80],
    [-2, -80],
    [-4, -82],
    [-6, -78],
    [-4, -76],
    [0, -78],
    [4, -77],
    [8, -77],
    [12, -72],
  ],

  // Australia
  [
    [-14, 126],
    [-14, 136],
    [-12, 136],
    [-12, 136],
    [-14, 136],
    [-16, 136],
    [-14, 126],
    [-14, 122],
    [-16, 118],
    [-20, 118],
    [-22, 114],
    [-28, 114],
    [-32, 116],
    [-34, 118],
    [-36, 136],
    [-38, 140],
    [-38, 148],
    [-36, 150],
    [-34, 152],
    [-32, 152],
    [-28, 154],
    [-24, 152],
    [-22, 150],
    [-18, 148],
    [-16, 146],
    [-14, 144],
    [-12, 142],
    [-14, 136],
    [-14, 126],
  ],

  // Antarctica (simplified arc — just the northern coast)
  [
    [-66, -180],
    [-68, -150],
    [-70, -120],
    [-68, -90],
    [-66, -60],
    [-68, -30],
    [-66, 0],
    [-68, 30],
    [-70, 60],
    [-68, 90],
    [-66, 120],
    [-68, 150],
    [-66, 180],
  ],
];

// ─── Globe ────────────────────────────────────────────────────────────────────

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let angle = 0;
    const RADIUS = 220;
    const DOT_SIZE = 1.55;
    const DOT_COUNT = 380;

    // Convert lat/lng degrees → unit 3D vector
    function toVec(lat: number, lng: number) {
      const phi = (lat * Math.PI) / 180;
      const theta = (lng * Math.PI) / 180;
      return {
        x: Math.cos(phi) * Math.cos(theta),
        y: Math.sin(phi),
        z: Math.cos(phi) * Math.sin(theta),
      };
    }

    // Golden angle dot distribution across sphere
    const dots: { x: number; y: number; z: number }[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOT_COUNT; i++) {
      const t = i / (DOT_COUNT - 1);
      const inc = Math.acos(1 - 2 * t);
      const az = golden * i;
      dots.push({
        x: Math.sin(inc) * Math.cos(az),
        y: Math.cos(inc),
        z: Math.sin(inc) * Math.sin(az),
      });
    }

    // Latitude grid lines as dot sequences
    const GRID_DOTS: { x: number; y: number; z: number }[] = [];
    const STEPS = 90;
    [-60, -30, 0, 30, 60].forEach((lat) => {
      for (let i = 0; i <= STEPS; i++) {
        const lng = (i / STEPS) * 360 - 180;
        GRID_DOTS.push(toVec(lat, lng));
      }
    });
    [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].forEach((lng) => {
      for (let i = 0; i <= STEPS; i++) {
        const lat = (i / STEPS) * 180 - 90;
        GRID_DOTS.push(toVec(lat, lng));
      }
    });

    // Pre-convert continent outlines to 3D vectors
    const continentVecs = CONTINENTS.map((poly) =>
      poly.map(([lat, lng]) => toVec(lat, lng)),
    );

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function rotateX(v: { x: number; y: number; z: number }) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: v.x * cos - v.z * sin, y: v.y, z: v.x * sin + v.z * cos };
    }

    function draw() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      // ← transparent clear so parent grid/glow shows through
      ctx!.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Grid dots (faintest layer)
      GRID_DOTS.forEach((d) => {
        const r = rotateX(d);
        if (r.z < -0.05) return;
        const vis = (r.z + 1) / 2;
        ctx!.beginPath();
        ctx!.arc(cx + r.x * RADIUS, cy + r.y * RADIUS, 0.75, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(249,115,22,${vis * 0.15})`;
        ctx!.fill();
      });

      // Surface dots
      dots.forEach((d) => {
        const r = rotateX(d);
        if (r.z < -0.05) return;
        const vis = (r.z + 1) / 2;
        const size = DOT_SIZE * (0.45 + vis * 0.7);
        ctx!.beginPath();
        ctx!.arc(cx + r.x * RADIUS, cy + r.y * RADIUS, size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(249,115,22,${0.12 + vis * 0.55})`;
        ctx!.fill();
      });

      // ── Continent outlines ─────────────────────────────────────────────────
      continentVecs.forEach((poly) => {
        if (poly.length < 2) return;
        ctx!.beginPath();
        let started = false;

        for (let i = 0; i < poly.length; i++) {
          const a = rotateX(poly[i]);
          const b = rotateX(poly[(i + 1) % poly.length]);

          // Only draw segment if both endpoints are on the visible hemisphere
          if (a.z < 0 || b.z < 0) {
            started = false;
            continue;
          }

          const ax2 = cx + a.x * RADIUS;
          const ay2 = cy + a.y * RADIUS;
          const bx2 = cx + b.x * RADIUS;
          const by2 = cy + b.y * RADIUS;

          if (!started) {
            ctx!.moveTo(ax2, ay2);
            started = true;
          }
          ctx!.lineTo(bx2, by2);
        }

        const frontDepth =
          poly.reduce((sum, p) => sum + rotateX(p).z, 0) / poly.length;
        const vis = Math.max(0, (frontDepth + 1) / 2);
        ctx!.strokeStyle = `rgba(249,115,22,${0.55 + vis * 0.4})`;
        ctx!.lineWidth = 1.2;
        ctx!.lineJoin = "round";
        ctx!.lineCap = "round";
        ctx!.stroke();
      });

      // Rim
      ctx!.beginPath();
      ctx!.arc(cx, cy, RADIUS + 3, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(249,115,22,0.07)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      angle += 0.0022;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ─── Scroll indicator ─────────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow pointer-events-none">
      <span className="text-charcoal-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        Scroll
      </span>
      <div className="w-px h-10 bg-gradient-to-b from-charcoal-600 to-transparent" />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const trustBadges = [
  "Photo + Video Evidence",
  "Written Reports",
  "Secure Dashboard",
  "Verified Inspectors",
];

export default function HeroSection() {
  return (
    <section className="relative bg-charcoal-950 min-h-screen flex items-center overflow-hidden pt-16">
      {/* Grid texture — visible through globe */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `linear-gradient(to right,#f97316 1px,transparent 1px),linear-gradient(to bottom,#f97316 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial vignette pulls focus left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 22% 50%,transparent 0%,rgba(10,10,10,0.88) 72%)",
        }}
      />

      {/* Glow blobs — sit below globe */}
      <div className="absolute top-16 right-32 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-64 w-72 h-72 bg-orange-400/6 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-orange-500/4 rounded-full blur-2xl pointer-events-none" />

      {/* ── Globe — right half, transparent canvas over the bg ───────────────── */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:flex items-center justify-center pointer-events-none">
        {/* Left-side fade so globe blends into text */}
        <div
          className="absolute inset-0 bg-transparent z-10"
          style={{ width: "35%" }}
        />
        <Globe />
      </div>

      {/* Mobile globe — centred behind content at low opacity */}
      <div className="absolute inset-0 lg:hidden flex items-center justify-center pointer-events-none opacity-[0.15]">
        <div className="w-full h-full">
          <Globe />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-xl lg:max-w-2xl">
          <div
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8 uppercase tracking-wider"
            style={{ animation: "hero-fade-up 0.7s ease both" }}
          >
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            Ground Truth Verification
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.04] mb-6 tracking-tight"
            style={{ animation: "hero-fade-up 0.7s 0.1s ease both" }}
          >
            Know exactly
            <br />
            what&rsquo;s happening
            <br />
            <span className="text-orange-400 italic">back home.</span>
          </h1>

          <p
            className="text-charcoal-300 text-lg sm:text-xl leading-relaxed mb-12"
            style={{ animation: "hero-fade-up 0.7s 0.2s ease both" }}
          >
            GRUTH sends an independent inspector to your site in Kenya. You get
            documented evidence — not reassurances.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 mb-12"
            style={{ animation: "hero-fade-up 0.7s 0.3s ease both" }}
          >
            <Link
              href="/request-verification"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5"
            >
              Request a Verification
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 text-charcoal-300 hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-8 py-4 font-medium transition-all duration-200"
            >
              See how it works
            </Link>
          </div>

          <div
            className="flex flex-wrap gap-x-6 gap-y-3"
            style={{ animation: "hero-fade-up 0.7s 0.4s ease both" }}
          >
            {trustBadges.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 text-charcoal-400 text-sm"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScrollIndicator />

      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(7px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2.4s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
