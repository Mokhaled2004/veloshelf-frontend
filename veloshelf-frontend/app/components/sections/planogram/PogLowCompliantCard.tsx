"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { AlertTriangle } from "lucide-react";
import type { PogLowRow } from "@/app/hooks/usePogData";

interface Props {
  data:    PogLowRow[];
  loading: boolean;
  title:   string;
  label:   string; // "SKU" or "Store"
}

export default function PogLowCompliantCard({ data, loading, title, label }: Props) {
  if (loading) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  const reversed = [...data].reverse();

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (p: any) => {
        const d = reversed[p[0].dataIndex];
        return [
          `<b>${d.name}</b>`,
          d.country ? `Country: ${d.country}` : "",
          `POG Compliance: ${d.pog_compliance_pct.toFixed(2)}%`,
          `Records: ${d.total_records.toLocaleString()}`,
        ]
          .filter(Boolean)
          .join("<br/>");
      },
    },
    grid: { top: 8, right: 70, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: "{value}%", color: "#94a3b8", fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    yAxis: {
      type: "category",
      data: reversed.map((r) => r.name),
      axisLabel: {
        color: "#002244", fontSize: 10, fontWeight: 500,
        overflow: "truncate", width: 140,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    series: [
      {
        type: "bar",
        barWidth: "55%",
        data: reversed.map((r) => ({
          value: r.pog_compliance_pct,
          itemStyle: {
            color:
              r.pog_compliance_pct < 25
                ? "#ef4444"
                : r.pog_compliance_pct < 40
                ? "#f59e0b"
                : "#0085C3",
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: {
          show: true,
          position: "right",
          formatter: (p: any) => `${Number(p.value).toFixed(1)}%`,
          color: "#002244",
          fontSize: 10,
          fontWeight: 600,
        },
      },
    ],
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
            {title}
          </h3>
        </div>
        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
          Bottom {data.length} {label}s
        </span>
      </div>
      <div className="flex-1" style={{ minHeight: 320 }}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}
