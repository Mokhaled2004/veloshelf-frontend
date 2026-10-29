"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { PogStoreRow } from "@/app/hooks/usePogData";

interface Props {
  data:    PogStoreRow[];
  loading: boolean;
  mode:    "top" | "bottom";
}

export default function PogTopBottomStoresCard({ data, loading, mode }: Props) {
  const isTop  = mode === "top";
  const title  = isTop ? "Top Stores — POG Compliance" : "Bottom Stores — POG Compliance";
  const Icon   = isTop ? TrendingUp : TrendingDown;
  const iconCls = isTop ? "text-green-500" : "text-red-500";

  if (loading) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
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
          `<b>${d.store_name}</b>`,
          d.country ? `Country: ${d.country}` : "",
          `POG: ${d.pog_compliance_pct.toFixed(2)}%`,
          `OSA: ${d.osa_pct.toFixed(2)}%`,
          `Facings: ${d.facings_pct.toFixed(2)}%`,
        ]
          .filter(Boolean)
          .join("<br/>");
      },
    },
    grid: { top: 8, right: 60, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: "{value}%", color: "#94a3b8", fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    yAxis: {
      type: "category",
      data: reversed.map((r) => r.store_name),
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
            color: isTop ? "#0085C3" : "#ef4444",
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
      <div className="flex items-center space-x-2 mb-4">
        <Icon className={`h-4 w-4 ${iconCls}`} />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
          {title}
        </h3>
      </div>
      <div className="flex-1" style={{ minHeight: 280 }}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}
