"use client";

import { Layers, Globe, BarChart2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { CatResult } from "@/app/hooks/useScanIndepth";
import {
  KpiCard, TrendChart, HBarChart, OosTable,
  SuggestionsPanel, PogRow, SectionHeader,
  osaColor, oosColor,
} from "./shared";

export default function CategoryDashboard({ data }: { data: CatResult }) {
  const { meta, kpi, top_skus, bottom_skus, by_country, by_channel, trend, pog, suggestions } = data;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-[#002244]"><Layers className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-black text-[#002244]">{meta.category}</h2>
            {meta.nestle_category && (
              <p className="text-xs text-gray-500">Nestle Category: <span className="font-semibold">{meta.nestle_category}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Category OSA" value={`${kpi.osa_pct}%`} sub={`${kpi.total_checks.toLocaleString()} checks`} color={osaColor(kpi.osa_pct)} />
        <KpiCard label="OOS Rate" value={`${kpi.oos_rate}%`} color={oosColor(kpi.oos_rate)} accent={kpi.oos_rate > 15 ? "border-red-200" : undefined} />
        <KpiCard label="Total SKUs" value={kpi.total_skus} sub="in category" />
        <KpiCard label="Total Stores" value={kpi.total_stores} sub="scanned" color="text-[#0085C3]" />
      </div>

      {/* ── Trend + By country ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<TrendingUp className="h-4 w-4" />} title="8-Week Category Trend" />
          <TrendChart data={trend} />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<Globe className="h-4 w-4" />} title="OSA by Country" />
          <HBarChart data={by_country} keyLabel="country" valueKey="osa_pct" />
        </div>
      </div>

      {/* ── Top SKUs + Bottom SKUs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<TrendingUp className="h-4 w-4 text-green-500" />} title="Top Performing SKUs" sub="Highest OSA %" />
          <OosTable rows={top_skus} nameKey="sku_name" codeKey="sap_code" />
        </div>
        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<TrendingDown className="h-4 w-4 text-red-500" />} title="Low Performing SKUs" sub="Lowest OSA % — action needed" />
          <OosTable rows={bottom_skus} nameKey="sku_name" codeKey="sap_code" />
        </div>
      </div>

      {/* ── By channel + Suggestions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<BarChart2 className="h-4 w-4" />} title="OSA by Channel" />
          <HBarChart data={by_channel} keyLabel="channel" valueKey="osa_pct" />
        </div>
        <div className="space-y-4">
          <SuggestionsPanel tips={suggestions} />
          {pog && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader icon={<Layers className="h-4 w-4" />} title="Planogram Compliance" sub="Average for this category" />
              <PogRow pog={pog} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
