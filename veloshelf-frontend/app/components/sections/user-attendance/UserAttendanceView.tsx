"use client";

import { useEffect } from "react";
import { ScanLine, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useScanIndepth } from "@/app/hooks/useScanIndepth";
import SearchPanel from "@/app/components/sections/scan-indepth/SearchPanel";
import SkuDashboard from "@/app/components/sections/scan-indepth/SkuDashboard";
import CategoryDashboard from "@/app/components/sections/scan-indepth/CategoryDashboard";
import StoreDashboard from "@/app/components/sections/scan-indepth/StoreDashboard";

export default function UserAttendanceView() {
  const {
    mode, query, suggestions, quickSugg, result, loading, searching, error,
    changeMode, onQueryChange, search, clearResult, loadQuickSuggestions,
  } = useScanIndepth();

  useEffect(() => { loadQuickSuggestions(mode); }, []);

  return (
    <div className="space-y-6 pb-12">

      {/* ── Sticky header — same pattern as every other section ── */}
      <div className="sticky top-0 z-[100] bg-white pt-6 pb-4 px-10 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-blue-50 p-2 text-[#002244]">
              <ScanLine className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#002244]">Scan Indepth</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {result
                  ? `Showing results for: ${
                      result.mode === "sku"      ? result.data.meta.sku_name
                    : result.mode === "category" ? result.data.meta.category
                    :                              result.data.meta.store_name
                    }`
                  : "Lookup SKU · Category · Store — full analytics in one click"}
              </p>
            </div>
          </div>
          {result && (
            <button
              onClick={clearResult}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-[#002244] hover:border-[#002244] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> New Search
            </button>
          )}
        </div>
      </div>

      <div className="px-10 space-y-6">

        {/* ── Search panel — always visible at the top ── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <SearchPanel
            mode={mode} query={query}
            suggestions={suggestions} quickSugg={quickSugg}
            searching={searching}
            onModeChange={changeMode}
            onQueryChange={onQueryChange}
            onSearch={search}
            onClear={clearResult}
          />
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
            <Loader2 className="h-6 w-6 text-[#0085C3] animate-spin" />
            <span className="text-sm">Scanning inventory data…</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <p className="text-xs text-red-500 mt-0.5">
                Check that the item exists in the database, or try a different search term.
              </p>
            </div>
          </div>
        )}

        {/* ── Result dashboard ── */}
        {result && !loading && (
          <>
            {result.mode === "sku"      && <SkuDashboard      data={result.data} />}
            {result.mode === "category" && <CategoryDashboard data={result.data} />}
            {result.mode === "store"    && <StoreDashboard    data={result.data} />}
          </>
        )}

      </div>
    </div>
  );
}
