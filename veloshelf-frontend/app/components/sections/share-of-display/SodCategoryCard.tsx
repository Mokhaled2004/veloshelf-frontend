"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { BarChart3 } from "lucide-react";
import type { SodCategoryRow } from "@/app/hooks/useShareOfDisplayData";

interface Props { data: SodCategoryRow[]; loading: boolean; selectedCategory: string | null; onSelectCategory: (c: string | null) => void; }

function smartMax(vals: number[]) {
  const raw = vals.length ? Math.max(...vals) : 100;
  if (raw <= 0) return 5; if (raw <= 1) return Math.ceil(raw * 10) / 10;
  if (raw <= 10) return Math.ceil(raw); if (raw <= 50) return Math.ceil(raw / 5) * 5;
  if (raw <= 95) return Math.ceil(raw / 10) * 10; return 100;
}

export default function SodCategoryCard({ data, loading, selectedCategory, onSelectCategory }: Props) {
  if (loading) return <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm"><Loader /></div>;

  const sorted   = [...data].sort((a, b) => (a.sod_percentage ?? 0) - (b.sod_percentage ?? 0));
  const chartMax = smartMax(sorted.map((r) => r.sod_percentage));

  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (p: any) => { const i = sorted[p[0].dataIndex]; return `<b>${i?.category ?? p[0].name}</b><br/>SOD: ${Number(i?.sod_percentage ?? 0).toFixed(2)}%`; } },
    grid: { top: 8, right: 20, bottom: 20, left: 8, containLabel: true },
    xAxis: { type: "value", max: chartMax, splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } }, axisLabel: { formatter: "{value}%", color: "#64748b", fontSize: 10 } },
    yAxis: { type: "category", data: sorted.map((r) => r.category), axisTick: { show: false }, axisLine: { lineStyle: { color: "#cbd5e1" } }, axisLabel: { color: "#002244", fontSize: 10, fontWeight: 500, overflow: "truncate", width: 130 } },
    series: [{ type: "bar", barWidth: "65%",
      data: sorted.map((r) => { const isSel = selectedCategory === r.category; const isActive = !selectedCategory || isSel;
        let color = "#cbd5e1"; if (isActive) color = r.sod_percentage < 15 ? "#ef4444" : r.sod_percentage < 30 ? "#f59e0b" : "#0085C3";
        return { value: r.sod_percentage, itemStyle: { color, borderRadius: [0, 4, 4, 0] } }; }) }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center space-x-2"><BarChart3 className="h-4 w-4 text-[#0085C3]" /><h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">Nestle Category Performance</h3></div>
        <div className="h-80 w-full mt-2">
          <ReactECharts option={option} onEvents={{ click: (p: any) => onSelectCategory(selectedCategory === p.name ? null : p.name) }} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
