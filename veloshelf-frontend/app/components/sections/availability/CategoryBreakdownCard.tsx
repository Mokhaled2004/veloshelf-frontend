"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { BarChart3 } from "lucide-react";
import type { CategoryRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: CategoryRow[];
  loading: boolean;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export default function CategoryBreakdownCard({ data, loading, selectedCategory, onSelectCategory }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  // Ascending so highest OSA appears at top in ECharts horizontal bar
  const sorted = [...data].sort((a, b) => (a.osa_percentage ?? 0) - (b.osa_percentage ?? 0));

  // Scale to the nearest round number above the largest value in the data.
  const rawMax   = data.length > 0 ? Math.max(...data.map((r) => r.osa_percentage ?? 0)) : 100;
  const chartMax = rawMax <= 0 ? 5
    : rawMax <= 1   ? Math.ceil(rawMax * 10) / 10
    : rawMax <= 10  ? Math.ceil(rawMax)
    : rawMax <= 50  ? Math.ceil(rawMax / 5) * 5
    : rawMax <= 95  ? Math.ceil(rawMax / 10) * 10
    : 100;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const item = sorted[params[0].dataIndex];
        return `<b>${item?.category ?? params[0].name}</b><br/>OSA: ${Number(item?.osa_percentage ?? 0).toFixed(2)}%`;
      },
    },
    // containLabel:true + left:8 → ECharts auto-sizes left margin for labels
    grid: { top: 8, right: 20, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      max: chartMax,
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      axisLabel: { formatter: "{value}%", color: "#64748b", fontSize: 10 },
    },
    yAxis: {
      type: "category",
      data: sorted.map((r) => r.category),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: {
        color: "#002244",
        fontSize: 10,
        fontWeight: 500,
        overflow: "truncate",
        width: 130,
      },
    },
    series: [{
      type: "bar",
      barWidth: "65%",
      data: sorted.map((r) => {
        const isSelected = selectedCategory === r.category;
        const isActive   = !selectedCategory || isSelected;
        let color = "#cbd5e1";
        if (isActive) color = r.osa_percentage < 60 ? "#ef4444" : r.osa_percentage < 75 ? "#f59e0b" : "#0085C3";
        return { value: r.osa_percentage, itemStyle: { color, borderRadius: [0, 4, 4, 0] } };
      }),
    }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4 text-[#0085C3]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
            Nestle Category Performance
          </h3>
        </div>
        <div className="h-80 w-full mt-2">
          <ReactECharts
            option={option}
            onEvents={{
              click: (p: any) => onSelectCategory(selectedCategory === p.name ? null : p.name),
            }}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
