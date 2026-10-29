"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { LayoutGrid } from "lucide-react";
import type { SosDisplayTypeRow } from "@/app/hooks/useShareOfShelfData";

interface Props {
  data:                SosDisplayTypeRow[];
  loading:             boolean;
  selectedDisplayType: string | null;
  onSelectDisplayType: (dt: string | null) => void;
}

function smartMax(values: number[]): number {
  const raw = values.length > 0 ? Math.max(...values) : 100;
  if (raw <= 0)  return 5;
  if (raw <= 1)  return Math.ceil(raw * 10) / 10;
  if (raw <= 10) return Math.ceil(raw);
  if (raw <= 50) return Math.ceil(raw / 5) * 5;
  if (raw <= 95) return Math.ceil(raw / 10) * 10;
  return 100;
}

export default function SosDisplayTypeCard({ data, loading, selectedDisplayType, onSelectDisplayType }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  const sorted   = [...data].sort((a, b) => b.total_records - a.total_records);
  const chartMax = smartMax(sorted.map((r) => r.sos_percentage));

  const option = {
    tooltip: {
      trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (p: any) => {
        const item = sorted[p[0].dataIndex];
        return `<b>${p[0].name}</b><br/>SOS: ${Number(item?.sos_percentage ?? 0).toFixed(2)}%<br/>Records: ${p[0].value.toLocaleString()}`;
      },
    },
    grid: { top: 15, right: 15, bottom: 15, left: 50, containLabel: true },
    xAxis: {
      type: "category", data: sorted.map((r) => r.display_type),
      axisTick: { show: false }, axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: { color: "#002244", fontSize: 11, fontWeight: 500, interval: 0 },
    },
    yAxis: {
      type: "value",
      max: chartMax,
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      axisLabel: { formatter: "{value}%", color: "#64748b", fontSize: 10 },
    },
    series: [{
      type: "bar", barWidth: "45%",
      data: sorted.map((r) => {
        const isSel    = selectedDisplayType === r.display_type;
        const isActive = !selectedDisplayType || isSel;
        let color = "#e2e8f0";
        if (isActive) color = r.sos_percentage < 15 ? "#ef4444" : r.sos_percentage < 30 ? "#f59e0b" : "#0085C3";
        return { value: r.total_records, itemStyle: { color, borderRadius: [4, 4, 0, 0] } };
      }),
    }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center space-x-2">
          <LayoutGrid className="h-4 w-4 text-[#0085C3]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">Display Type Breakdown</h3>
        </div>
        <div className="h-[320px] w-full mt-2">
          <ReactECharts
            option={option}
            onEvents={{ click: (p: any) => onSelectDisplayType(selectedDisplayType === p.name ? null : p.name) }}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
