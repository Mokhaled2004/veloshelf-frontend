"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { Globe } from "lucide-react";
import type { PogCountryRow } from "@/app/hooks/usePogData";

interface Props {
  data:    PogCountryRow[];
  loading: boolean;
}

function sliceColor(v: number) {
  if (v < 40) return "#ef4444";
  if (v < 65) return "#f59e0b";
  return "#0085C3";
}

export default function PogCountryCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (p: any) => {
        const d = data[p.dataIndex];
        return [
          `<b>${p.name}</b>`,
          `POG: ${d.pog_compliance_pct.toFixed(2)}%`,
          `OSA: ${d.osa_pct.toFixed(2)}%`,
          `Facings: ${d.facings_pct.toFixed(2)}%`,
          `Placement: ${d.product_placement_pct.toFixed(2)}%`,
          `Assortment: ${d.assortment_pct.toFixed(2)}%`,
          `Share: ${p.percent}%`,
        ].join("<br/>");
      },
    },
    series: [
      {
        type: "pie",
        radius: ["48%", "75%"],
        center: ["50%", "52%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        emphasis: { scale: true, scaleSize: 6 },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          color: "#002244",
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 16,
        },
        labelLine: { length: 10, length2: 12, smooth: true },
        data: data.map((r) => ({
          name:      r.country,
          value:     r.total_records,
          itemStyle: { color: sliceColor(r.pog_compliance_pct) },
        })),
      },
    ],
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center space-x-2 mb-3">
        <Globe className="h-4 w-4 text-[#0085C3]" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
          POG Compliance by Country
        </h3>
      </div>

      <div className="flex-1" style={{ minHeight: 290 }}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}
