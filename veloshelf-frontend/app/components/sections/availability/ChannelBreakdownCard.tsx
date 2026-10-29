"use client";

import Loader from "@/app/components/ui/Loader";
import ReactECharts from "echarts-for-react";
import { PieChart, ZoomIn, ArrowUpCircle, XCircle } from "lucide-react";
import type { ChannelRow, DrilldownRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: ChannelRow[] | DrilldownRow[];
  loading: boolean;
  selectedChannel: string | null;
  drilledChannel:  string | null;
  onSelectChannel: (channel: string | null) => void;
  onDrillDown:     (channel: string) => void;
  onResetDrill:    () => void;
}

function sliceColor(osa: number, active: boolean) {
  if (!active)   return "#e2e8f0";
  if (osa < 60)  return "#ef4444";
  if (osa < 75)  return "#f59e0b";
  return "#0085C3";
}

export default function ChannelBreakdownCard({
  data, loading, selectedChannel, drilledChannel,
  onSelectChannel, onDrillDown, onResetDrill,
}: Props) {
  if (loading) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  const isDrilled   = !!drilledChannel;
  const drillData   = data as DrilldownRow[];
  const channelData = data as ChannelRow[];
  const drillRev    = [...drillData].reverse();

  const barOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const item = drillRev[params[0].dataIndex];
        return `<b>${item?.name ?? params[0].name}</b><br/>OSA: ${item?.osa_percentage ?? 0}%<br/>Checks: ${params[0].value.toLocaleString()}`;
      },
    },
    grid: { top: 8, right: 20, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
    },
    yAxis: {
      type: "category",
      data: drillRev.map((r) => r.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: {
        color: "#002244",
        fontSize: 10,
        fontWeight: 500,
        overflow: "truncate",
        width: 130,
      },
    },
    series: [{
      type: "bar",
      barWidth: "60%",
      data: drillRev.map((r) => ({
        value: r.total_checks,
        itemStyle: {
          color: r.osa_percentage < 60 ? "#ef4444" : r.osa_percentage < 75 ? "#f59e0b" : "#0085C3",
          borderRadius: [0, 4, 4, 0],
        },
      })),
    }],
  };

  const pieOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const item = channelData[params.dataIndex];
        return `<b>${params.name}</b><br/>OSA: ${item?.osa_percentage ?? params.percent}%<br/>Checks: ${params.value} (${params.percent}%)`;
      },
    },
    series: [{
      type: "pie",
      radius: ["55%", "80%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
      selectedMode: "single",
      selectedOffset: 12,
      emphasis: { scale: true, scaleSize: 6 },
      label: { show: true, formatter: "{b}\n{d}%", color: "#002244", fontSize: 10, fontWeight: 600 },
      data: channelData.map((r) => {
        const isSelected = selectedChannel === r.channel;
        return {
          name: r.channel,
          value: r.total_checks,
          selected: isSelected,
          itemStyle: { color: sliceColor(r.osa_percentage, !selectedChannel || isSelected) },
        };
      }),
    }],
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-[#0085C3]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
              {drilledChannel ? `Stores: ${drilledChannel}` : "Channel Distribution"}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            {drilledChannel ? (
              <button onClick={onResetDrill} className="flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#002244] hover:bg-blue-100 transition-colors">
                <ArrowUpCircle className="h-3 w-3" /><span>Drill Up</span>
              </button>
            ) : selectedChannel ? (
              <button onClick={() => onSelectChannel(null)} className="flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                <XCircle className="h-3 w-3" /><span>Reset Slice</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#002244]">
                <ZoomIn className="h-3 w-3" /><span>Double-click Drill</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-80 w-full mt-2">
          <ReactECharts
            option={isDrilled ? barOption : pieOption}
            onEvents={isDrilled ? {} : {
              click:    (p: any) => onSelectChannel(selectedChannel === p.name ? null : p.name),
              dblclick: (p: any) => onDrillDown(p.name),
            }}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
