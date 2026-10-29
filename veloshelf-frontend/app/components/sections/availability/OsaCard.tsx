"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/components/ui/Loader";
import { Globe } from "lucide-react";
import type { OsaSummary } from "@/app/hooks/useAvailabilityData";

interface OsaCardProps {
  data: OsaSummary | null;
  loading: boolean;
  selectedCountry:     string | null;
  selectedChannel:     string | null;
  selectedCategory:    string | null;
  selectedAccount:     string | null;
  selectedDisplayType: string | null;
  onResetFilter: () => void;
}

function getOsaColor(val: number) {
  if (val <= 35) return "text-red-500";
  if (val < 70)  return "text-amber-500";
  return "text-green-500";
}

export default function OsaCard({
  data,
  loading,
  selectedCountry,
  selectedChannel,
  selectedCategory,
  selectedAccount,
  selectedDisplayType,
  onResetFilter,
}: OsaCardProps) {
  const target = data?.osa_percentage ?? 0;
  const [display, setDisplay] = useState("0.00");

  // Animated counter
  useEffect(() => {
    let start: number | null = null;
    const duration = 900;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay((ease * target).toFixed(2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);

  if (loading && !data) {
    return (
      <div className="flex h-full min-h-[280px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  const hasFilters =
    selectedCountry !== null || selectedChannel !== null ||
    selectedCategory !== null || selectedAccount !== null ||
    selectedDisplayType !== null;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 shrink-0 text-blue-600" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            On-Shelf Availability
          </h3>
        </div>
        {hasFilters ? (
          <button
            onClick={onResetFilter}
            className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Reset Filters
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#002244]">
            Live Scope
          </span>
        )}
      </div>

      <div className="my-auto py-4 flex items-baseline justify-center">
        <span className={`text-8xl font-black tracking-tighter transition-colors duration-300 ${getOsaColor(target)}`}>
          {display}
        </span>
        <span className={`ml-1 text-5xl font-extrabold transition-colors duration-300 ${getOsaColor(target)}`}>
          %
        </span>
      </div>

      <div className="mt-2 rounded-xl bg-gray-50 p-3 border border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-semibold text-gray-700">0 - 35</span>
            </div>
            <span className="text-[10px] text-gray-400">OSA &le; 35</span>
          </div>
          <div className="flex flex-col items-center border-x border-gray-200">
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-semibold text-gray-700">35 - 70</span>
            </div>
            <span className="text-[10px] text-gray-400">35 &lt; OSA &lt; 70</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-semibold text-gray-700">70 - 100</span>
            </div>
            <span className="text-[10px] text-gray-400">OSA &ge; 70</span>
          </div>
        </div>
      </div>
    </div>
  );
}
