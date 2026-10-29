"use client";

import { Store, Layers, TrendingUp, AlertTriangle, BarChart2 } from "lucide-react";
import type { StoreResult } from "@/app/hooks/useScanIndepth";
import {
  KpiCard, TrendChart, HBarChart, OosTable,
  SuggestionsPanel, PogRow, SectionHeader,
  osaColor, oosColor, osaBg,
} from "./shared";

export default function StoreDashboard({ data }: { data: StoreResult }) {
  const { meta, last_scan, kpi, by_category, oos_skus, trend, pog, suggestions } = data;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#002244]"><Store className="h-5 w-5" /></div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold text-[#0085C3] bg-blue-50 rounded px-1.5 py-0.5">{meta.store_code}</span>
                {last_scan && <span className="text-[10px] text-gray-400">· Last scan: {last_scan}</span>}
              </div>
              <h2 className="text-xl font-black text-[#002244]">{meta.store_name}</h2>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${osaBg(kpi.osa_pct)}`}>
            <span className={`h-2 w-2 rounded-full ${kpi.osa_pct >= 70 ? "bg-green-500" : kpi.osa_pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} />
            {kpi.osa_pct >= 85 ? "EXCELLENT"
              : kpi.osa_pct >= 70 ? "HEALTHY"
              : kpi.osa_pct >= 55 ? "DEVELOPING"
              : kpi.osa_pct >= 40 ? "AT RISK"
              : "CRITICAL"}
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Store OSA" value={`${kpi.osa_pct}%`} sub={`${kpi.total_checks.toLocaleString()} checks`} color={osaColor(kpi.osa_pct)} />
        <KpiCard label="OOS Rate" value={`${kpi.oos_rate}%`} color={oosColor(kpi.oos_rate)} accent={kpi.oos_rate > 15 ? "border-red-200" : undefined} />
        <KpiCard label="SKUs Scanned" value={kpi.total_skus} sub="distinct products" />
        <KpiCard label="Categories" value={kpi.total_cats} sub="product categories" color="text-[#0085C3]" />
      </div>

      {/* ── Trend + By category ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<TrendingUp className="h-4 w-4" />} title="8-Week Store OSA Trend" />
          <TrendChart data={trend} />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<BarChart2 className="h-4 w-4" />} title="OSA by Category" />
          <HBarChart data={by_category} keyLabel="category" valueKey="osa_pct" />
        </div>
      </div>

      {/* ── OOS SKUs + Suggestions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<AlertTriangle className="h-4 w-4 text-red-500" />} title="Lowest OSA SKUs" sub="Products needing immediate attention" />
          <OosTable rows={oos_skus} nameKey="sku_name" codeKey="sap_code" />
        </div>
        <div className="space-y-4">
          <SuggestionsPanel tips={suggestions} />
          {pog && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader icon={<Layers className="h-4 w-4" />} title="Planogram Compliance" sub="POG metrics for this store" />
              <PogRow pog={pog} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
