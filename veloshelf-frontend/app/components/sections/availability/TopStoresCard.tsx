"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { TrendingUp } from "lucide-react";
import type { StoreRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: StoreRow[];
  loading: boolean;
}

export default function TopStoresCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  // Reverse so highest OSA renders at the top of the horizontal chart
  const reversed = [...data].reverse();

  // Scale to the nearest round number above the largest value in the data.
  // e.g. max=2.94 → 3,  max=87.5 → 90,  max=100 → 100
  const rawMax   = data.length > 0 ? Math.max(...data.map((r) => r.osa_percentage ?? 0)) : 100;
  const chartMax = rawMax <= 0 ? 5
    : rawMax <= 1   ? Math.ceil(rawMax * 10) / 10          // sub-1% → round to 0.1
    : rawMax <= 10  ? Math.ceil(rawMax)                    // ≤10%   → round to 1
    : rawMax <= 50  ? Math.ceil(rawMax / 5) * 5            // ≤50%   → round to 5
    : rawMax <= 95  ? Math.ceil(rawMax / 10) * 10          // ≤95%   → round to 10
    : 100;                                                  // >95%   → just use 100

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // Show full store name in tooltip — no truncation here
      formatter: (params: any) => {
        const item = reversed[params[0].dataIndex];
        return `<b>${item?.store_name ?? params[0].name}</b><br/>OSA: ${Number(item?.osa_percentage ?? 0).toFixed(2)}%`;
      },
    },
    // containLabel:true lets ECharts shrink the plot area automatically so
    // the y-axis labels never overflow the canvas boundary
    grid: { top: 8, right: 52, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      max: chartMax,
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      axisLabel: { formatter: "{value}%", color: "#64748b", fontSize: 10 },
    },
    yAxis: {
      type: "category",
      data: reversed.map((r) => r.store_name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      // No truncation — full name displayed; ECharts wraps the grid automatically
      axisLabel: {
        color: "#64748b",
        fontSize: 10,
        overflow: "truncate",
        width: 130,
        // Show full name as a rich tooltip via the ECharts axis tooltip below
      },
    },
    series: [{
      type: "bar",
      barWidth: "60%",
      // Inline label on the right of each bar — right margin (52px) guarantees it fits
      label: {
        show: true,
        position: "right",
        formatter: (p: any) => `${Number(p.value).toFixed(2)}%`,
        fontSize: 10,
        color: "#002244",
        fontWeight: "bold",
      },
      data: reversed.map((r) => ({
        value: r.osa_percentage,
        itemStyle: { color: "#0085C3", borderRadius: [0, 4, 4, 0] },
      })),
    }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-[#0085C3]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
            Nestle OSA — Top 10 Stores
          </h3>
        </div>
        <div className="h-80 w-full mt-2">
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
