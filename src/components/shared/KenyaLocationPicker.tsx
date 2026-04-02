"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

export interface LocationValue {
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  value?: LocationValue | null;
  onChange: (loc: LocationValue) => void;
  error?: boolean;
  placeholder?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state_district?: string;
    country?: string;
    country_code?: string;
  };
}

// ─── Kenya bounds ─────────────────────────────────────────────────────────────
// SW: -4.68°, 33.91°  NE: 4.62°, 41.90°
const KENYA_BOUNDS = {
  sw: { lat: -4.68, lng: 33.91 },
  ne: { lat: 4.62, lng: 41.9 },
  center: { lat: 0.02, lng: 37.9 },
  zoom: 6,
};

// Clamp a coordinate inside Kenya's bounding box
function clampToKenya(lat: number, lng: number) {
  return {
    lat: Math.max(KENYA_BOUNDS.sw.lat, Math.min(KENYA_BOUNDS.ne.lat, lat)),
    lng: Math.max(KENYA_BOUNDS.sw.lng, Math.min(KENYA_BOUNDS.ne.lng, lng)),
  };
}

// ─── Leaflet map (dynamically imported to avoid SSR) ─────────────────────────

// We import the map internals in a separate small component so that
// `dynamic(..., { ssr: false })` can wrap just the Leaflet code.
function LeafletMapInner({
  lat,
  lng,
  onDragEnd,
}: {
  lat: number;
  lng: number;
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import Leaflet so it only runs client-side
    let L: any;
    let map: any;
    let marker: any;

    async function init() {
      L = (await import("leaflet")).default;

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current || mapRef.current) return;

      map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: lat === KENYA_BOUNDS.center.lat ? KENYA_BOUNDS.zoom : 14,
        maxBounds: [
          [KENYA_BOUNDS.sw.lat - 1, KENYA_BOUNDS.sw.lng - 1],
          [KENYA_BOUNDS.ne.lat + 1, KENYA_BOUNDS.ne.lng + 1],
        ],
        maxBoundsViscosity: 1.0,
        minZoom: 5,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom orange pin to match GRUTH brand
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:40px;position:relative;">
          <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
              fill="#f97316" stroke="#c2570d" stroke-width="1.5"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        </div>`,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });

      marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        const clamped = clampToKenya(pos.lat, pos.lng);
        marker.setLatLng([clamped.lat, clamped.lng]);
        onDragEnd(clamped.lat, clamped.lng);
      });

      // Also allow click-to-place on the map
      map.on("click", (e: any) => {
        const clamped = clampToKenya(e.latlng.lat, e.latlng.lng);
        marker.setLatLng([clamped.lat, clamped.lng]);
        map.panTo([clamped.lat, clamped.lng]);
        onDragEnd(clamped.lat, clamped.lng);
      });
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when lat/lng props change (e.g. from autocomplete)
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng], { animate: true });
      // Zoom in if we were at default zoom
      if (mapRef.current.getZoom() <= KENYA_BOUNDS.zoom + 1) {
        mapRef.current.setZoom(14, { animate: true });
      }
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "280px",
        width: "100%",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    />
  );
}

// Wrap in dynamic to suppress SSR
const LeafletMap = dynamic(() => Promise.resolve(LeafletMapInner), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] w-full rounded-xl bg-charcoal-100 flex items-center justify-center">
      <div className="flex items-center gap-2 text-charcoal-400 text-sm">
        <div className="w-4 h-4 border-2 border-charcoal-300 border-t-orange-500 rounded-full animate-spin" />
        Loading map…
      </div>
    </div>
  ),
});

// ─── Nominatim autocomplete ────────────────────────────────────────────────────

function useNominatim(query: string) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "6");
        url.searchParams.set("countrycodes", "ke"); // Kenya only
        url.searchParams.set("bounded", "1");
        url.searchParams.set(
          "viewbox",
          `${KENYA_BOUNDS.sw.lng},${KENYA_BOUNDS.ne.lat},${KENYA_BOUNDS.ne.lng},${KENYA_BOUNDS.sw.lat}`,
        );

        const res = await fetch(url.toString(), {
          headers: { "Accept-Language": "en", "User-Agent": "GRUTH-App/1.0" },
        });
        const data = await res.json();
        setResults(
          data.filter((r: NominatimResult) => r.address?.country_code === "ke"),
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350); // debounce 350ms

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading };
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    const res = await fetch(url.toString(), {
      headers: { "Accept-Language": "en", "User-Agent": "GRUTH-App/1.0" },
    });
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function KenyaLocationPicker({
  value,
  onChange,
  error,
  placeholder,
}: Props) {
  const [inputText, setInputText] = useState(value?.address ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [mapKey, setMapKey] = useState(0); // forces map re-mount on open

  const [pinPos, setPinPos] = useState({
    lat: value?.lat ?? KENYA_BOUNDS.center.lat,
    lng: value?.lng ?? KENYA_BOUNDS.center.lng,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, loading } = useNominatim(showDropdown ? inputText : "");

  // Sync input text when parent value changes
  useEffect(() => {
    if (value?.address && value.address !== inputText) {
      setInputText(value.address);
      setPinPos({ lat: value.lat, lng: value.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectResult = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const addr = result.display_name;
      setInputText(addr);
      setPinPos({ lat, lng });
      setShowDropdown(false);
      onChange({ address: addr, lat, lng });
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputText(v);
    setShowDropdown(v.length >= 3);
    // If user clears the input, clear the value
    if (!v)
      onChange({
        address: "",
        lat: KENYA_BOUNDS.center.lat,
        lng: KENYA_BOUNDS.center.lng,
      });
  };

  const handleDragEnd = useCallback(
    async (lat: number, lng: number) => {
      setPinPos({ lat, lng });
      setReversing(true);
      const addr = await reverseGeocode(lat, lng);
      setInputText(addr);
      onChange({ address: addr, lat, lng });
      setReversing(false);
    },
    [onChange],
  );

  const handleMapToggle = () => {
    setMapVisible((v) => {
      if (!v) setMapKey((k) => k + 1); // re-mount map each time opened
      return !v;
    });
  };

  // Shorten a long Nominatim address for display
  const shorten = (name: string) => {
    const parts = name.split(",");
    return parts.slice(0, 4).join(",").trim();
  };

  return (
    <div className="space-y-2">
      {/* ── Text input with autocomplete ─────────────────────────────────── */}
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          {/* Pin icon */}
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-400 z-10">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputText.length >= 3) setShowDropdown(true);
            }}
            className={`input-field pl-10 pr-24 ${error ? "!border-red-300 focus:!ring-red-400/50" : ""}`}
            placeholder={placeholder ?? "Search location in Kenya…"}
            autoComplete="off"
          />

          {/* Right-side controls */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Loading spinner */}
            {(loading || reversing) && (
              <div className="w-3.5 h-3.5 border-2 border-charcoal-200 border-t-orange-500 rounded-full animate-spin" />
            )}

            {/* Clear */}
            {inputText && !loading && !reversing && (
              <button
                type="button"
                onClick={() => {
                  setInputText("");
                  setShowDropdown(false);
                  onChange({
                    address: "",
                    lat: KENYA_BOUNDS.center.lat,
                    lng: KENYA_BOUNDS.center.lng,
                  });
                  inputRef.current?.focus();
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full text-charcoal-400 hover:bg-charcoal-100 transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Map toggle */}
            <button
              type="button"
              onClick={handleMapToggle}
              title={mapVisible ? "Hide map" : "Pick on map"}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
                mapVisible
                  ? "bg-orange-100 text-orange-700"
                  : "bg-charcoal-100 text-charcoal-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
              {mapVisible ? "Hide" : "Map"}
            </button>
          </div>
        </div>

        {/* ── Autocomplete dropdown ───────────────────────────────────────── */}
        {showDropdown && (results.length > 0 || loading) && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-charcoal-200 rounded-xl shadow-xl overflow-hidden">
            {loading && results.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-charcoal-400">
                <div className="w-3.5 h-3.5 border-2 border-charcoal-200 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
                Searching Kenya…
              </div>
            )}
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectResult(r);
                }}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b border-charcoal-50 last:border-0"
              >
                <svg
                  className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal-900 truncate">
                    {shorten(r.display_name)}
                  </p>
                  <p className="text-xs text-charcoal-400 truncate mt-0.5">
                    {r.display_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map panel ─────────────────────────────────────────────────────── */}
      {mapVisible && (
        <div className="rounded-xl overflow-hidden border border-charcoal-200 shadow-sm">
          {/* Leaflet CSS — loaded once via a style tag */}
          <style>{`
            @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
          `}</style>

          <LeafletMap
            key={mapKey}
            lat={pinPos.lat}
            lng={pinPos.lng}
            onDragEnd={handleDragEnd}
          />

          <div className="bg-charcoal-50 border-t border-charcoal-100 px-3 py-2 flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-orange-500 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <p className="text-xs text-charcoal-500">
              {reversing
                ? "Getting address…"
                : inputText
                  ? `Pinned: ${shorten(inputText)}`
                  : "Click on the map or drag the pin to set your location"}
            </p>
          </div>
        </div>
      )}

      {/* Coordinates chip — shows when a location is selected */}
      {value?.lat && value.lat !== KENYA_BOUNDS.center.lat && (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-[11px] text-charcoal-400 font-mono">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
          <span className="text-[11px] text-charcoal-400">— Kenya</span>
        </div>
      )}
    </div>
  );
}
