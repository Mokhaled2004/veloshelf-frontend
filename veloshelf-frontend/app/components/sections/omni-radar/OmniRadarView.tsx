"use client";

/**
 * OmniRadarView
 * - Radar centred, 8 KPI cards orbiting it
 * - Fills the full viewport height, zero scroll
 * - Pulsing green dot + "Scanner Active: N Stores" in the radar status bar
 * - Hover on a radar dot → tooltip
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchWithAuth } from "@/app/api";
import Loader from "@/app/components/ui/Loader";
import { Radar } from "lucide-react";

import type { OsaSummary }  from "@/app/hooks/useAvailabilityData";
import type { SosSummary }  from "@/app/hooks/useShareOfShelfData";
import type { SodSummary }  from "@/app/hooks/useShareOfDisplayData";
import type { PogSummary }  from "@/app/hooks/usePogData";

// ─── helpers ─────────────────────────────────────────────────────────────────
async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetchWithAuth(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

function dotColor(v: number)  { return v < 40 ? "#ef4444" : v < 65 ? "#f59e0b" : "#22c55e"; }
function dotGlow(v: number)   { return v < 40 ? "rgba(239,68,68,0.65)" : v < 65 ? "rgba(245,158,11,0.65)" : "rgba(34,197,94,0.65)"; }
function valColor(v: number)  { return v < 40 ? "text-red-500" : v < 65 ? "text-amber-500" : "text-green-500"; }
function barBg(v: number)     { return v < 40 ? "#ef4444"     : v < 65 ? "#f59e0b"          : "#22c55e"; }

// 8 KPIs evenly spaced at 45° intervals, top = 0°
const KPI_DEFS = [
  { key: "osa",        label: "On-Shelf\nAvailability", short: "OSA",        angleDeg:   0 },
  { key: "sos",        label: "Share of\nShelf",        short: "SOS",        angleDeg:  45 },
  { key: "sod",        label: "Share of\nDisplay",      short: "SOD",        angleDeg:  90 },
  { key: "pog",        label: "POG\nCompliance",        short: "POG",        angleDeg: 135 },
  { key: "assortment", label: "Planogram\nAssortment",  short: "Assort",     angleDeg: 180 },
  { key: "placement",  label: "Product\nPlacement",     short: "Placement",  angleDeg: 225 },
  { key: "facings",    label: "Facings\nScore",         short: "Facings",    angleDeg: 270 },
  { key: "osa_pog",    label: "OSA\n(POG)",             short: "POG OSA",    angleDeg: 315 },
];

// ─── canvas radar ─────────────────────────────────────────────────────────────
interface DotInfo { short: string; value: number; angleDeg: number; label: string; }
interface TooltipInfo { x: number; y: number; label: string; value: number; }

function ScanRadar({
  dots, size, activeStores, loadingStores,
}: {
  dots: DotInfo[]; size: number; activeStores: number; loadingStores: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepRef  = useRef(0);
  const rafRef    = useRef<number>(0);
  const posRef    = useRef<{ x: number; y: number; dot: DotInfo }[]>([]);
  const [tip, setTip] = useState<TooltipInfo | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const S = size, CX = S / 2, CY = S / 2, R = S * 0.44;

    function frame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, S, S);

      // background
      const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
      bg.addColorStop(0, "#0d2137"); bg.addColorStop(0.7, "#0a1f30"); bg.addColorStop(1, "#071625");
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();

      // rings
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.strokeStyle = "rgba(0,210,150,0.13)";
        ctx.beginPath(); ctx.arc(CX, CY, R * f, 0, Math.PI * 2); ctx.stroke();
      });

      // crosshairs
      ctx.strokeStyle = "rgba(0,210,150,0.09)";
      for (let a = 0; a < 360; a += 45) {
        const rad = (a * Math.PI) / 180;
        ctx.beginPath(); ctx.moveTo(CX, CY);
        ctx.lineTo(CX + Math.cos(rad) * R, CY + Math.sin(rad) * R); ctx.stroke();
      }

      // sweep trail
      const sw = sweepRef.current, TRAIL = (78 * Math.PI) / 180;
      for (let i = 0; i < 36; i++) {
        const t = i / 36;
        ctx.beginPath(); ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, R, sw - TRAIL * (1 - t), sw - TRAIL * (1 - t) + TRAIL / 36);
        ctx.closePath(); ctx.fillStyle = `rgba(0,210,120,${t * 0.3})`; ctx.fill();
      }

      // sweep line
      ctx.save();
      ctx.beginPath(); ctx.moveTo(CX, CY);
      ctx.lineTo(CX + Math.cos(sw) * R, CY + Math.sin(sw) * R);
      ctx.strokeStyle = "rgba(0,255,140,0.92)"; ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(0,255,140,0.75)"; ctx.shadowBlur = 10; ctx.stroke(); ctx.restore();

      // dots
      const newPos: typeof posRef.current = [];
      dots.forEach(dot => {
        const aRad = ((dot.angleDeg - 90) * Math.PI) / 180;
        const r    = R * Math.max(0.13, dot.value / 100) * 0.87;
        const x    = CX + Math.cos(aRad) * r, y = CY + Math.sin(aRad) * r;
        newPos.push({ x, y, dot });

        let diff = sw - aRad;
        while (diff >  Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        const near = Math.abs(diff) < 0.22;

        const g = ctx.createRadialGradient(x, y, 0, x, y, near ? 18 : 10);
        g.addColorStop(0, dotGlow(dot.value)); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(x, y, near ? 18 : 10, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();

        ctx.beginPath(); ctx.arc(x, y, near ? 6.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = dotColor(dot.value);
        ctx.shadowColor = dotGlow(dot.value); ctx.shadowBlur = near ? 16 : 8; ctx.fill(); ctx.shadowBlur = 0;

        ctx.font = `bold ${Math.round(S * 0.026)}px system-ui,sans-serif`;
        ctx.fillStyle = "rgba(190,225,215,0.88)"; ctx.textAlign = "center";
        const lx = CX + Math.cos(aRad) * (r + S * 0.055);
        const ly = CY + Math.sin(aRad) * (r + S * 0.055) + 3;
        ctx.fillText(dot.short, lx, ly);
      });
      posRef.current = newPos;

      // outer ring
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,200,130,0.22)"; ctx.lineWidth = 2; ctx.stroke();

      // centre dot
      ctx.beginPath(); ctx.arc(CX, CY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,255,140,0.55)"; ctx.fill();
    }

    function animate() {
      sweepRef.current += 0.017;
      if (sweepRef.current > Math.PI * 2) sweepRef.current -= Math.PI * 2;
      frame();
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dots, size]);

  function onMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = size / rect.width, sy = size / rect.height;
    const mx = (e.clientX - rect.left) * sx, my = (e.clientY - rect.top) * sy;
    for (const { x, y, dot } of posRef.current) {
      if (Math.sqrt((mx - x) ** 2 + (my - y) ** 2) < 15) {
        setTip({ x: x / sx, y: y / sy, label: dot.label, value: dot.value });
        return;
      }
    }
    setTip(null);
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size} height={size}
          className="rounded-full cursor-crosshair"
          style={{ width: size, height: size }}
          onMouseMove={onMove}
          onMouseLeave={() => setTip(null)}
        />
        {tip && (
          <div
            className="pointer-events-none absolute z-50 rounded-xl border border-gray-600 bg-[#0a1f30]/95 px-3 py-2 shadow-2xl"
            style={{ left: tip.x + 16, top: tip.y - 36, minWidth: 110 }}
          >
            <p className="text-[10px] font-semibold text-gray-300 whitespace-pre-line leading-tight">{tip.label}</p>
            <p className="mt-1 text-base font-black" style={{ color: dotColor(tip.value) }}>
              {tip.value.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* ── Pulsing status bar ── */}
      <div className="mt-3 flex items-center gap-2 rounded-full bg-[#071625]/90 border border-[rgba(0,200,130,0.35)] px-5 py-2">
        {/* pulsing dot */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <span className="font-mono text-[12px] font-semibold text-[#00d296] whitespace-nowrap">
          Scanner Active:&nbsp;
          {loadingStores
            ? <span className="opacity-50">—</span>
            : <span className="text-white">{activeStores.toLocaleString()} Stores</span>
          }
        </span>
      </div>
    </div>
  );
}

// ─── orbit mini-card ──────────────────────────────────────────────────────────
function OrbitCard({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  const [disp, setDisp] = useState("0.00");
  useEffect(() => {
    if (loading) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 750, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisp((e * value).toFixed(2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, loading]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-md hover:shadow-lg transition-all p-4 text-center w-full h-full gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-tight whitespace-pre-line">{label}</span>
      {loading
        ? <Loader />
        : <span className={`text-3xl font-black tracking-tighter leading-none ${valColor(value)}`}>
            {disp}<span className="text-lg font-extrabold">%</span>
          </span>
      }
      <div className="w-full h-[4px] rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%`, background: barBg(value) }} />
      </div>
    </div>
  );
}

// ─── main view ────────────────────────────────────────────────────────────────
export default function OmniRadarView() {
  const [osa,  setOsa]  = useState<OsaSummary | null>(null);
  const [sos,  setSos]  = useState<SosSummary | null>(null);
  const [sod,  setSod]  = useState<SodSummary | null>(null);
  const [pog,  setPog]  = useState<PogSummary | null>(null);
  const [activeStores, setActiveStores] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true); setLoadingStores(true);
    const [r1, r2, r3, r4, r5] = await Promise.allSettled([
      safeFetch<OsaSummary>("/availability/osa-summary"),
      safeFetch<SosSummary>("/sos/summary"),
      safeFetch<SodSummary>("/sod/summary"),
      safeFetch<PogSummary>("/pog/summary"),
      safeFetch<{ active_stores: number }>("/pog/active-stores"),
    ]);
    const g = <T,>(r: PromiseSettledResult<T | null>): T | null =>
      r.status === "fulfilled" ? r.value : null;
    setOsa(g(r1)); setSos(g(r2)); setSod(g(r3)); setPog(g(r4));
    const storeRes = g(r5);
    if (storeRes) setActiveStores(storeRes.active_stores);
    setLoading(false); setLoadingStores(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const vals = [
    osa?.osa_percentage        ?? 0,
    sos?.sos_percentage        ?? 0,
    sod?.sod_percentage        ?? 0,
    pog?.pog_compliance_pct    ?? 0,
    pog?.assortment_pct        ?? 0,
    pog?.product_placement_pct ?? 0,
    pog?.facings_pct           ?? 0,
    pog?.osa_pct               ?? 0,
  ];

  const dots: DotInfo[] = KPI_DEFS.map((k, i) => ({
    short: k.short, label: k.label, value: vals[i], angleDeg: k.angleDeg,
  }));

  const overall = vals.reduce((a, b) => a + b, 0) / vals.length;

  // Layout constants — tuned to fill ~100vh minus the ~64px header
  const RADAR_PX   = 340;   // canvas size
  const ORBIT_R    = 370;   // card centre distance from origin
  const CARD_W     = 165;
  const CARD_H     = 96;
  const BOARD      = ORBIT_R * 2 + CARD_W + 24; // outer square

  const cardPositions = KPI_DEFS.map((k, i) => {
    const rad = ((k.angleDeg - 90) * Math.PI) / 180;
    return {
      ...k,
      value: vals[i],
      x: BOARD / 2 + Math.cos(rad) * ORBIT_R - CARD_W / 2,
      y: BOARD / 2 + Math.sin(rad) * ORBIT_R - CARD_H / 2,
    };
  });

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>

      {/* header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-[#002244]"><Radar className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#002244]">Omni Radar</h1>
            <p className="text-[11px] text-gray-400">Unified execution — hover dots for details</p>
          </div>
        </div>
        {!loading && (
          <div
            className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold"
            style={{
              borderColor: overall < 40 ? "#fca5a5" : overall < 65 ? "#fcd34d" : "#86efac",
              background:  overall < 40 ? "#fef2f2" : overall < 65 ? "#fffbeb" : "#f0fdf4",
              color:       overall < 40 ? "#ef4444" : overall < 65 ? "#f59e0b" : "#22c55e",
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: dotColor(overall) }} />
            Overall {overall.toFixed(1)}%
          </div>
        )}
      </div>

      {/* orbit area — flex-1 so it fills remaining height exactly */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#f8fafc]">
        <div className="relative shrink-0" style={{ width: BOARD, height: BOARD }}>

          {/* dashed connector lines */}
          <svg className="absolute inset-0 pointer-events-none" width={BOARD} height={BOARD}>
            {cardPositions.map((cp, i) => (
              <line key={i}
                x1={BOARD / 2} y1={BOARD / 2}
                x2={cp.x + CARD_W / 2} y2={cp.y + CARD_H / 2}
                stroke={dotColor(cp.value)} strokeWidth={1.5}
                strokeOpacity={0.18} strokeDasharray="5 4"
              />
            ))}
          </svg>

          {/* radar centred */}
          <div
            className="absolute rounded-full"
            style={{
              left:   BOARD / 2 - RADAR_PX / 2,
              top:    BOARD / 2 - RADAR_PX / 2,
              width:  RADAR_PX,
              height: RADAR_PX,
              background: "radial-gradient(circle, #0d2137 60%, #071020)",
              padding: 4,
            }}
          >
            <ScanRadar
              dots={dots}
              size={RADAR_PX - 8}
              activeStores={activeStores}
              loadingStores={loadingStores}
            />
          </div>

          {/* 8 orbit cards */}
          {cardPositions.map((cp) => (
            <div key={cp.key} className="absolute"
              style={{ left: cp.x, top: cp.y, width: CARD_W, height: CARD_H }}>
              <OrbitCard label={cp.label} value={cp.value} loading={loading} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
