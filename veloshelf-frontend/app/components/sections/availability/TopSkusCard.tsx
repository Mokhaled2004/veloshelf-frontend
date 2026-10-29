"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { PackageCheck } from "lucide-react";
import type { SkuRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: SkuRow[];
  loading: boolean;
}

export default function TopSkusCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  const hasChart = data.some((r) => (r.osa_percentage ?? 0) > 0);
  const reversed = [...data].reverse();

  // Scale to the nearest round number above the largest value in the data.
  const rawMax   = hasChart ? Math.max(...data.map((r) => r.osa_percentage ?? 0)) : 100;
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
      // Full SKU name in tooltip — no truncation
      formatter: (params: any) => {
        const item = reversed[params[0].dataIndex];
        return `<b>${item?.sku_name ?? params[0].name}</b><br/>OSA: ${Number(item?.osa_percentage ?? 0).toFixed(2)}%`;
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
      data: reversed.map((r) => r.sku_name),
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
        fontSize: 9,
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PackageCheck className="h-4 w-4 text-[#0085C3]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
              Nestle OSA — Top 10 SKUs
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">{data.length} SKUs</span>
        </div>

        <div className="h-80 w-full mt-2">
          {!hasChart ? (
            <div className="h-80 overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
                    <th className="pb-2.5">SKU Name</th>
                    <th className="pb-2.5 text-right">OSA %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {data.length > 0 ? data.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 text-gray-600">
                      <td className="py-2.5 truncate max-w-[220px]" title={row.sku_name}>{row.sku_name}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                          {Number(row.osa_percentage ?? 0).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} className="text-center py-6 text-gray-400 text-xs">No data for current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
          )}
        </div>
      </div>
    </div>
  );
}
