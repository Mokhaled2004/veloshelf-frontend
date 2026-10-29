"use client";

import { Barcode, Globe, Zap, AlertTriangle, TrendingUp, BarChart2, MapPin, Layers } from "lucide-react";
import type { SkuResult } from "@/app/hooks/useScanIndepth";
import {
  KpiCard, TrendChart, DonutChart, HBarChart, OosTable,
  SuggestionsPanel, PogRow, SectionHeader,
  osaColor, oosColor, osaBg,
} from "./shared";

export default function SkuDashboard({ data }: { data: SkuResult }) {
  const { meta, last_scan, kpi, trend, by_country, by_channel, oos_stores, pog, suggestions } = data;

  return (
    <div className="space-y-6">

      {/* ── Identity header ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#002244]">
              <Barcode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold text-[#0085C3] bg-blue-50 rounded px-1.5 py-0.5">
                  {meta.sap_code}
                </span>
                {meta.barcode && <span className="text-[10px] text-gray-400 font-mono">{meta.barcode}</span>}
                {last_scan && <span className="text-[10px] text-gray-400">· Last scan: {last_scan}</span>}
              </div>
              <h2 className="text-xl font-black text-[#002244]">{meta.sku_name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Category: <span className="font-semibold">{meta.nestle_category || meta.category}</span>
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${osaBg(kpi.osa_pct)}`}>
            <span className={`h-2 w-2 rounded-full ${kpi.osa_pct >= 70 ? "bg-green-500" : kpi.osa_pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} />
            Scanner:{" "}
            {kpi.osa_pct >= 85 ? "EXCELLENT"
              : kpi.osa_pct >= 70 ? "HEALTHY"
              : kpi.osa_pct >= 55 ? "DEVELOPING"
              : kpi.osa_pct >= 40 ? "AT RISK"
              : "CRITICAL"}
          </div>
        </div>
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="On-Shelf Availability"
          value={`${kpi.osa_pct}%`}
          sub={`${kpi.in_stock_stores} / ${kpi.total_stores} stores in-stock`}
          color={osaColor(kpi.osa_pct)}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        />
        <KpiCard
          label="Out-of-Stock Rate"
          value={`${kpi.oos_rate}%`}
          sub={`${kpi.oos_stores} / ${kpi.total_stores} stores empty shelf`}
          color={oosColor(kpi.oos_rate)}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          accent={kpi.oos_rate > 10 ? "border-red-200" : "border-gray-100"}
        />
        <KpiCard
          label="Total Stores Scanned"
          value={kpi.total_stores}
          sub={`${kpi.total_checks.toLocaleString()} total scan records`}
          icon={<MapPin className="h-4 w-4 text-[#0085C3]" />}
        />
        <KpiCard
          label="Available Scans"
          value={kpi.avail_checks.toLocaleString()}
          sub={`of ${kpi.total_checks.toLocaleString()} total checks`}
          color="text-[#0085C3]"
          icon={<Zap className="h-4 w-4 text-[#0085C3]" />}
        />
      </div>

      {/* ── Donut + Trend ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<Layers className="h-4 w-4" />} title="Availability Distribution" sub="Current snapshot" />
          <DonutChart inStock={kpi.in_stock_stores} oos={kpi.oos_stores} total={kpi.total_stores} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl bg-green-50 border border-green-100 p-2 text-center">
              <p className="text-lg font-black text-green-600">{kpi.in_stock_stores}</p>
              <p className="text-[10px] text-green-600 font-semibold">In Stock (OSA)</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 p-2 text-center">
              <p className="text-lg font-black text-red-500">{kpi.oos_stores}</p>
              <p className="text-[10px] text-red-500 font-semibold">Out of Stock</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<TrendingUp className="h-4 w-4" />} title="8-Week OSA Trend" sub="Availability over time" />
          <TrendChart data={trend} />
        </div>
      </div>

      {/* ── By country + By channel ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<Globe className="h-4 w-4" />} title="OSA by Country" />
          <HBarChart data={by_country} keyLabel="country" valueKey="osa_pct" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={<BarChart2 className="h-4 w-4" />} title="OSA by Channel" />
          <HBarChart data={by_channel} keyLabel="channel" valueKey="osa_pct" />
        </div>
      </div>

      {/* ── OOS stores + Suggestions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            title="Lowest Performing Stores"
            sub="Action required — ranked by OSA %"
          />
          <OosTable rows={oos_stores} nameKey="store_name" codeKey="store_code" />
        </div>
        <div className="space-y-4">
          <SuggestionsPanel tips={suggestions} />
          {pog && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader icon={<Layers className="h-4 w-4" />} title="Planogram Compliance" sub="POG metrics for this SKU" />
              <PogRow pog={pog} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
