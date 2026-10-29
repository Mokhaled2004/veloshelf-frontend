"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { TrendingUp } from "lucide-react";
import type { SosStoreRow } from "@/app/hooks/useShareOfShelfData";

interface Props { data: SosStoreRow[]; loading: boolean; }

function smartMax(values: number[]): number {
  const raw = values.length > 0 ? Math.max(...values) : 100;
  if (raw <= 0)  return 5;
  if (raw <= 1)  return Math.ceil(raw * 10) / 10;
  if (raw <= 10) return Math.ceil(raw);
  if (raw <= 50) return Math.ceil(raw / 5) * 5;
  if (raw <= 95) return Math.ceil(raw / 10) * 10;
  return 100;
}

export default function SosTopStoresCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  const reversed = [...data].reverse();
  const chartMax = smartMax(data.map((r) => r.sos_percentage));

  const option = {
    tooltip: {
      trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (p: any) => {
        const item = reversed[p[0].dataIndex];
        return `<b>${item?.store_name ?? p[0].name}</b><br/>SOS: ${Number(item?.sos_percentage ?? 0).toFixed(2)}%`;
      },
    },
    grid: { top: 8, right: 52, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: "value", min: 0, max: chartMax,
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      axisLabel: { formatter: "{value}%", color: "#64748b", fontSize: 10 },
    },
    yAxis: {
      type: "category", data: reversed.map((r) => r.store_name),
      axisTick: { show: false }, axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: { color: "#64748b", fontSize: 10, overflow: "truncate", width: 130 },
    },
    series: [{
      type: "bar", barWidth: "60%",
      label: { show: true, position: "right", formatter: (p: any) => `${Number(p.value).toFixed(2)}%`, fontSize: 10, color: "#002244", fontWeight: "bold" },
      data: reversed.map((r) => ({ value: r.sos_percentage, itemStyle: { color: "#0085C3", borderRadius: [0, 4, 4, 0] } })),
    }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-[#0085C3]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">SOS — Top 10 Stores</h3>
        </div>
        <div className="h-80 w-full mt-2">
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
