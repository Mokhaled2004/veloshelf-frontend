"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { LayoutGrid } from "lucide-react";
import type { DisplayTypeRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: DisplayTypeRow[];
  loading: boolean;
  selectedDisplayType: string | null;
  onSelectDisplayType: (dt: string | null) => void;
}

export default function DisplayTypeBreakdownCard({ data, loading, selectedDisplayType, onSelectDisplayType }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.total_checks - a.total_checks);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const item = sorted[params[0].dataIndex];
        return `<b>${params[0].name}</b><br/>OSA: ${Number(item?.osa_percentage ?? 0).toFixed(2)}%<br/>Checks: ${params[0].value.toLocaleString()}`;
      },
    },
    grid: { top: 15, right: 15, bottom: 15, left: 50, containLabel: true },
    xAxis: {
      type: "category",
      data: sorted.map((r) => r.display_type),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: { color: "#002244", fontSize: 11, fontWeight: 500, interval: 0 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      axisLabel: { color: "#64748b", fontSize: 10 },
    },
    series: [{
      type: "bar",
      barWidth: "45%",
      data: sorted.map((r) => {
        const isSelected = selectedDisplayType === r.display_type;
        const isActive   = !selectedDisplayType || isSelected;
        let color = "#e2e8f0";
        if (isActive) color = r.osa_percentage < 60 ? "#ef4444" : r.osa_percentage < 75 ? "#f59e0b" : "#0085C3";
        return { value: r.total_checks, itemStyle: { color, borderRadius: [4, 4, 0, 0] } };
      }),
    }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center space-x-2">
          <LayoutGrid className="h-4 w-4 text-[#0085C3]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
            Display Type Breakdown
          </h3>
        </div>
        <div className="h-[320px] w-full mt-2">
          <ReactECharts
            option={option}
            onEvents={{
              click: (p: any) => onSelectDisplayType(selectedDisplayType === p.name ? null : p.name),
            }}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
