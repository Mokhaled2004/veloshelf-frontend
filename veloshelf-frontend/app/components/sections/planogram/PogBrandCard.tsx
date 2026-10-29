"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { Layers } from "lucide-react";
import type { PogBrandRow } from "@/app/hooks/usePogData";

interface Props {
  data:    PogBrandRow[];
  loading: boolean;
}

const METRIC_COLORS = ["#0085C3", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
const METRIC_LABELS = [
  "POG Compliance",
  "OSA",
  "Facings",
  "Product Placement",
  "Assortment",
];

export default function PogBrandCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  const metrics: Array<keyof PogBrandRow> = [
    "pog_compliance_pct",
    "osa_pct",
    "facings_pct",
    "product_placement_pct",
    "assortment_pct",
  ];

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any[]) => {
        const brand = data[params[0].dataIndex]?.brand ?? params[0].axisValueLabel;
        return [
          `<b>${brand}</b>`,
          ...params.map(
            (p: any) => `${p.marker}${p.seriesName}: ${Number(p.value).toFixed(2)}%`
          ),
        ].join("<br/>");
      },
    },
    legend: {
      top: 0,
      textStyle: { color: "#002244", fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: { top: 40, right: 16, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((r) => r.brand),
      axisLabel: {
        color: "#002244", fontSize: 10, fontWeight: 600,
        rotate: data.length > 4 ? 30 : 0,
        overflow: "truncate", width: 80,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: "{value}%", color: "#94a3b8", fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    series: metrics.map((key, i) => ({
      name: METRIC_LABELS[i],
      type: "bar",
      barMaxWidth: 18,
      itemStyle: { color: METRIC_COLORS[i], borderRadius: [3, 3, 0, 0] },
      data: data.map((r) => Number(r[key] ?? 0)),
    })),
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center space-x-2 mb-4">
        <Layers className="h-4 w-4 text-[#0085C3]" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
          POG Compliance by Brand
        </h3>
      </div>
      <div className="flex-1" style={{ minHeight: 300 }}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}
