"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { TrendingDown } from "lucide-react";
import type { StoreRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: StoreRow[];
  loading: boolean;
}

export default function BottomStoresCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  // Reverse so lowest OSA renders at the top (worst performers visible first)
  const reversed = [...data].reverse();

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
        const item = reversed[params[0].dataIndex];
        return `<b>${item?.store_name ?? params[0].name}</b><br/>OSA: ${Number(item?.osa_percentage ?? 0).toFixed(2)}%`;
      },
    },
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
      axisLabel: {
        color: "#64748b",
        fontSize: 10,
        overflow: "truncate",
        width: 130,
      },
    },
    series: [{
      type: "bar",
      barWidth: "60%",
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
        itemStyle: { color: "#ef4444", borderRadius: [0, 4, 4, 0] },
      })),
    }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center space-x-2">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
            Nestle OSA — Bottom 10 Stores
          </h3>
        </div>
        <div className="h-80 w-full mt-2">
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
