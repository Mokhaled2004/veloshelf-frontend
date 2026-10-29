"use client";
/** Shared micro-components used across SKU / Category / Store dashboards */

import ReactECharts from "echarts-for-react";
import { Lightbulb, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Color helpers ─────────────────────────────────────────────────────────────
export function osaColor(v: number) { return v < 40 ? "text-red-500" : v < 55 ? "text-orange-500" : v < 70 ? "text-amber-500" : v < 85 ? "text-green-500" : "text-emerald-600"; }
export function osaBg(v: number)    { return v < 40 ? "bg-red-50 border-red-200" : v < 55 ? "bg-orange-50 border-orange-200" : v < 70 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"; }
export function oosColor(v: number) { return v > 20 ? "text-red-500" : v > 5 ? "text-amber-500" : "text-green-500"; }
export function barColor(v: number) { return v < 40 ? "#ef4444" : v < 55 ? "#f97316" : v < 70 ? "#f59e0b" : "#0085C3"; }

// ── KPI card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string; value: string | number; sub?: string;
  color?: string; icon?: React.ReactNode; accent?: string;
}
export function KpiCard({ label, value, sub, color = "text-[#002244]", icon, accent }: KpiCardProps) {
  return (
    <div className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all ${accent ?? "border-gray-100"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
        {icon && <span className="opacity-60">{icon}</span>}
      </div>
      <span className={`text-3xl font-black tracking-tighter ${color}`}>{value}</span>
      {sub && <span className="mt-1 text-[11px] text-gray-400">{sub}</span>}
    </div>
  );
}

// ── Trend line chart ─────────────────────────────────────────────────────────
export function TrendChart({ data, label = "OSA %" }: { data: { week: string; osa_pct: number }[]; label?: string }) {
  if (!data.length) return <div className="flex h-48 items-center justify-center text-sm text-gray-400">No trend data</div>;
  const option = {
    tooltip: { trigger: "axis", formatter: (p: any) => `${p[0].axisValueLabel}<br/>${label}: <b>${p[0].value}%</b>` },
    grid: { top: 16, right: 16, bottom: 24, left: 8, containLabel: true },
    xAxis: {
      type: "category", data: data.map(d => d.week),
      axisLabel: { color: "#94a3b8", fontSize: 10 }, axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value", min: 0, max: 100,
      axisLabel: { formatter: "{value}%", color: "#94a3b8", fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: [{
      type: "line", data: data.map(d => d.osa_pct),
      smooth: true, symbol: "circle", symbolSize: 6,
      lineStyle: { color: "#0085C3", width: 2.5 },
      itemStyle: { color: "#0085C3", borderColor: "#fff", borderWidth: 2 },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(0,133,195,0.18)" }, { offset: 1, color: "rgba(0,133,195,0)" }] } },
      markLine: { silent: true, data: [{ yAxis: 70, lineStyle: { color: "#22c55e", type: "dashed", width: 1.5 }, label: { formatter: "Target 70%", color: "#22c55e", fontSize: 10 } }] },
    }],
  };
  return <ReactECharts option={option} style={{ height: 200, width: "100%" }} />;
}

// ── Donut chart ──────────────────────────────────────────────────────────────
export function DonutChart({ inStock, oos, total }: { inStock: number; oos: number; total: number }) {
  const option = {
    tooltip: { trigger: "item", formatter: (p: any) => `${p.name}: <b>${p.value}</b> stores (${p.percent}%)` },
    series: [{
      type: "pie", radius: ["55%", "80%"], center: ["50%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
      label: { show: false },
      data: [
        { name: "In-Stock (OSA)", value: inStock, itemStyle: { color: "#22c55e" } },
        { name: "Out-of-Stock", value: oos,     itemStyle: { color: "#ef4444" } },
      ],
    }],
  };
  return (
    <div className="relative">
      <ReactECharts option={option} style={{ height: 200, width: "100%" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-[#002244]">{total}</span>
        <span className="text-[10px] font-semibold text-gray-400">Total Stores</span>
      </div>
    </div>
  );
}

// ── Horizontal bar chart ─────────────────────────────────────────────────────
export function HBarChart({ data, keyLabel, valueKey = "osa_pct", title }: {
  data: Record<string, any>[]; keyLabel: string; valueKey?: string; title?: string;
}) {
  if (!data.length) return <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data</div>;
  const reversed = [...data].reverse();
  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (p: any) => `${p[0].axisValueLabel}: <b>${Number(p[0].value).toFixed(1)}%</b>` },
    grid: { top: 8, right: 52, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%", color: "#94a3b8", fontSize: 10 }, splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } } },
    yAxis: { type: "category", data: reversed.map(r => r[keyLabel]), axisLabel: { color: "#002244", fontSize: 10, fontWeight: 600, overflow: "truncate", width: 140 }, axisTick: { show: false }, axisLine: { lineStyle: { color: "#e2e8f0" } } },
    series: [{
      type: "bar", barWidth: "55%",
      data: reversed.map(r => ({ value: r[valueKey], itemStyle: { color: barColor(r[valueKey]), borderRadius: [0, 4, 4, 0] } })),
      label: { show: true, position: "right", formatter: (p: any) => `${Number(p.value).toFixed(1)}%`, color: "#002244", fontSize: 10, fontWeight: 600 },
    }],
  };
  return <ReactECharts option={option} style={{ height: Math.max(160, reversed.length * 32), width: "100%" }} />;
}

// ── OOS table ────────────────────────────────────────────────────────────────
export function OosTable({ rows, nameKey, codeKey, osaPctKey = "osa_pct" }: {
  rows: Record<string, any>[]; nameKey: string; codeKey?: string; osaPctKey?: string;
}) {
  if (!rows.length) return <p className="text-sm text-gray-400 py-4 text-center">No items found</p>;
  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      {rows.map((r, i) => {
        const v = Number(r[osaPctKey] ?? 0);
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2">
            <span className="text-[10px] font-mono text-gray-400 w-5 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#002244] truncate">{r[nameKey]}</p>
              {codeKey && <p className="text-[10px] text-gray-400">{r[codeKey]}</p>}
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden mx-2">
              <div className="h-full rounded-full" style={{ width: `${Math.min(v, 100)}%`, background: barColor(v) }} />
            </div>
            <span className={`text-xs font-bold w-12 text-right ${osaColor(v)}`}>{v.toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Suggestions panel ────────────────────────────────────────────────────────
export function SuggestionsPanel({ tips }: { tips: string[] }) {
  if (!tips.length) return null;
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-[#0085C3]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#002244]">AI Recommendations</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0085C3] shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── POG mini row ─────────────────────────────────────────────────────────────
export function PogRow({ pog }: { pog: { pog_compliance_pct: number | null; osa_pct: number | null; facings_pct: number | null; product_placement_pct: number | null; assortment_pct: number | null } }) {
  const items = [
    { label: "POG",        v: pog.pog_compliance_pct },
    { label: "OSA",        v: pog.osa_pct },
    { label: "Facings",    v: pog.facings_pct },
    { label: "Placement",  v: pog.product_placement_pct },
    { label: "Assortment", v: pog.assortment_pct },
  ];
  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map(({ label, v }) => (
        <div key={label} className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
          <span className={`text-lg font-black mt-1 ${v !== null ? osaColor(v) : "text-gray-300"}`}>
            {v !== null ? `${v.toFixed(1)}%` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[#0085C3]">{icon}</span>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#002244]">{title}</h3>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
