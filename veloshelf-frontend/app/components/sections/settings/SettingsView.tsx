"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/app/api";
import {
  Settings, RefreshCw, CheckCircle2, XCircle, ChevronDown,
  CalendarDays, Database, Clock, AlertTriangle, Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Week { year: number; week_number: number; week_label: string; }
type RefreshStatus = "idle" | "loading" | "success" | "error";
type PogRefreshStatus = "idle" | "loading" | "success" | "error";
interface RefreshResult {
  success: boolean; year: number; week_number: number;
  sections_refreshed: string[]; message: string;
}
interface LogEntry {
  id: number; timestamp: string; year: number; week_number: number;
  week_label: string; status: "success" | "error"; message: string;
  sections?: string[];
}

// ── Table groups ──────────────────────────────────────────────────────────────

const TABLE_GROUPS = [
  {
    label: "Availability (OSA)",
    color: "blue",
    tables: [
      "agg_osa_filter_options", "agg_osa_by_store", "agg_osa_by_country",
      "agg_osa_by_channel", "agg_osa_by_display_type", "agg_osa_by_category",
      "agg_osa_by_account", "agg_osa_by_sku", "agg_osa_sku_zero_stores",
    ],
  },
  {
    label: "Share of Shelf (SOS)",
    color: "indigo",
    tables: ["agg_sos_filter_options", "agg_sos_by_store"],
  },
  {
    label: "Share of Display (SOD)",
    color: "violet",
    tables: ["agg_sod_filter_options", "agg_sod_by_store"],
  },
  {
    label: "Planogram Compliance (POG)",
    color: "emerald",
    tables: ["agg_pog_filter_options", "agg_pog_by_store"],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsView() {
  const [weeks, setWeeks]               = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [weeksLoading, setWeeksLoading] = useState(true);
  const [weeksError, setWeeksError]     = useState<string | null>(null);

  const [status, setStatus]               = useState<RefreshStatus>("idle");
  const [result, setResult]               = useState<RefreshResult | null>(null);
  const [errorMessage, setErrorMessage]   = useState<string | null>(null);
  const [log, setLog]                     = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter]       = useState(0);

  // POG-specific refresh (no week needed)
  const [pogStatus, setPogStatus]         = useState<PogRefreshStatus>("idle");
  const [pogMessage, setPogMessage]       = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setWeeksLoading(true);
      setWeeksError(null);
      try {
        const res = await fetchWithAuth("/settings/available-weeks");
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`);
        const data: Week[] = await res.json();
        setWeeks(data);
        if (data.length > 0) setSelectedWeek(data[0]);
      } catch (e: any) {
        setWeeksError(e.message || "Failed to load weeks.");
      } finally {
        setWeeksLoading(false);
      }
    }
    load();
  }, []);

  async function handleRefreshAll() {
    if (!selectedWeek || status === "loading") return;
    setStatus("loading");
    setResult(null);
    setErrorMessage(null);
    const started = new Date().toLocaleTimeString();

    try {
      const res = await fetchWithAuth("/settings/refresh-all-aggregates", {
        method: "POST",
        body: JSON.stringify({ year: selectedWeek.year, week_number: selectedWeek.week_number }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);

      setResult(data);
      setStatus("success");
      setLogCounter((c) => {
        const id = c + 1;
        setLog((prev) => [{
          id, timestamp: started, year: selectedWeek.year,
          week_number: selectedWeek.week_number, week_label: selectedWeek.week_label,
          status: "success", message: data.message, sections: data.sections_refreshed,
        }, ...prev.slice(0, 19)]);
        return id;
      });
    } catch (e: any) {
      const msg = e.message || "Unknown error.";
      setErrorMessage(msg);
      setStatus("error");
      setLogCounter((c) => {
        const id = c + 1;
        setLog((prev) => [{
          id, timestamp: started, year: selectedWeek.year,
          week_number: selectedWeek.week_number, week_label: selectedWeek.week_label,
          status: "error", message: msg,
        }, ...prev.slice(0, 19)]);
        return id;
      });
    }
  }

  async function handleRefreshPog() {
    if (pogStatus === "loading") return;
    setPogStatus("loading");
    setPogMessage(null);
    try {
      const res = await fetchWithAuth("/settings/refresh-pog", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setPogMessage(data.message);
      setPogStatus("success");
    } catch (e: any) {
      setPogMessage(e.message || "Unknown error.");
      setPogStatus("error");
    }
  }

  const isLoading = status === "loading";

  // Which sections were refreshed (from last result)
  const refreshedSections = result?.sections_refreshed ?? [];

  function tableState(tableName: string, groupLabel: string) {
    // POG uses its own refresh status
    if (groupLabel.includes("POG")) {
      if (pogStatus === "loading") return "loading";
      if (pogStatus === "success") return "success";
      return "idle";
    }
    if (!isLoading && status !== "success") return "idle";
    if (isLoading) return "loading";
    // success — green only if that group was actually refreshed
    return refreshedSections.some((s) => s.includes(groupLabel.split(" ")[0])) ? "success" : "skipped";
  }

  const colorMap: Record<string, string> = { blue: "#0085C3", indigo: "#4F46E5", violet: "#7C3AED", emerald: "#059669" };
  const bgMap:    Record<string, string> = { blue: "bg-blue-50/40 border-blue-100", indigo: "bg-indigo-50/40 border-indigo-100", violet: "bg-violet-50/40 border-violet-100", emerald: "bg-emerald-50/40 border-emerald-100" };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-[100] bg-white pt-6 pb-4 px-10 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-blue-50 p-2 text-[#002244]"><Settings className="h-6 w-6" /></div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#002244]">Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">Admin tools — aggregate data management</p>
          </div>
        </div>
      </div>

      <div className="px-10 space-y-6">
        {/* Refresh Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center space-x-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002244]/10"><Database className="h-4 w-4 text-[#002244]" /></div>
            <div>
              <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">Refresh All Aggregate Tables</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select a week and rebuild aggregates for all 4 analytics sections. Safe to re-run when new data arrives.</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Table groups */}
            <div className="space-y-4">
              {TABLE_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMap[group.color] }} />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{group.label}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.tables.map((tbl) => {
                      const state = tableState(tbl, group.label);
                      return (
                        <div key={tbl} className={`flex items-center space-x-2 rounded-xl px-3 py-2 border text-xs font-medium transition-colors duration-300 ${
                          state === "loading" ? "border-blue-100 bg-blue-50/50 text-[#0085C3]"
                          : state === "success" ? "border-green-100 bg-green-50/50 text-green-700"
                          : state === "skipped" ? "border-gray-100 bg-gray-50 text-gray-400"
                          : "border-gray-100 bg-gray-50 text-gray-600"
                        }`}>
                          {state === "loading" ? <Loader2 className="h-3 w-3 animate-spin text-[#0085C3] shrink-0" />
                          : state === "success" ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                          : <div className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />}
                          <span className="font-mono truncate">{tbl}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Week picker + button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 min-w-0 max-w-xs">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Select Week</label>
                <div className="relative">
                  <button onClick={() => setDropdownOpen((o) => !o)} disabled={weeksLoading || !!weeksError}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#002244] shadow-sm hover:border-[#0085C3] hover:bg-blue-50/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <div className="flex items-center space-x-2 min-w-0">
                      <CalendarDays className="h-4 w-4 text-[#0085C3] shrink-0" />
                      {weeksLoading ? <span className="text-gray-400">Loading weeks…</span>
                      : weeksError ? <span className="text-red-500 truncate">{weeksError}</span>
                      : selectedWeek ? <span className="truncate">{selectedWeek.week_label} — Y{selectedWeek.year} W{selectedWeek.week_number}</span>
                      : <span className="text-gray-400">No weeks found</span>}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && weeks.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                      {weeks.map((w) => {
                        const isActive = selectedWeek?.year === w.year && selectedWeek?.week_number === w.week_number;
                        return (
                          <button key={`${w.year}-${w.week_number}`}
                            onClick={() => { setSelectedWeek(w); setDropdownOpen(false); setStatus("idle"); setResult(null); setErrorMessage(null); }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-blue-50 ${isActive ? "bg-blue-50 text-[#0085C3] font-semibold" : "text-gray-700"}`}>
                            <span>{w.week_label}</span>
                            <span className="text-xs text-gray-400 font-mono ml-4 shrink-0">Y{w.year} · W{w.week_number}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleRefreshAll} disabled={!selectedWeek || isLoading || !!weeksError}
                className={`flex items-center space-x-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLoading ? "bg-[#002244] text-white cursor-wait" : "bg-[#002244] text-white hover:bg-[#003366] active:scale-95"}`}>
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Refreshing All…</span></>
                : <><RefreshCw className="h-4 w-4" /><span>Refresh All Aggregates</span></>}
              </button>
            </div>

            {/* Success/error banners */}
            {status === "success" && result && (
              <div className="flex items-start space-x-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Refresh completed successfully</p>
                  <p className="text-xs text-green-700 mt-0.5">{result.message}</p>
                </div>
              </div>
            )}
            {status === "error" && errorMessage && (
              <div className="flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Refresh failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start space-x-2 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Re-running is safe — the backend detects which sections have data for the selected week
                and only refreshes those. The Redis analytics cache is flushed automatically.
              </p>
            </div>
          </div>
        </div>

        {/* POG-only Refresh Card */}
        <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center space-x-3 px-6 py-4 border-b border-emerald-100 bg-emerald-50/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
              <Database className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                Refresh Planogram Compliance (POG)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                POG fact tables have no week dimension — rebuilds all POG aggregates from the full dataset.
              </p>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 text-sm text-gray-500">
              Rebuilds{" "}
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-[#002244]">agg_pog_filter_options</span>
              {" "}and{" "}
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-[#002244]">agg_pog_by_store</span>
              {" "}from all 4 POG fact tables. Flushes Redis cache automatically.
            </div>

            <button
              onClick={handleRefreshPog}
              disabled={pogStatus === "loading"}
              className={`shrink-0 flex items-center space-x-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                pogStatus === "loading"
                  ? "bg-emerald-700 text-white cursor-wait"
                  : "bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95"
              }`}
            >
              {pogStatus === "loading"
                ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Refreshing POG…</span></>
                : <><RefreshCw className="h-4 w-4" /><span>Refresh POG Aggregates</span></>}
            </button>
          </div>

          {pogStatus === "success" && pogMessage && (
            <div className="mx-6 mb-5 flex items-start space-x-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">POG refresh completed</p>
                <p className="text-xs text-green-700 mt-0.5">{pogMessage}</p>
              </div>
            </div>
          )}
          {pogStatus === "error" && pogMessage && (
            <div className="mx-6 mb-5 flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">POG refresh failed</p>
                <p className="text-xs text-red-600 mt-0.5">{pogMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Session log */}
        {log.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center space-x-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100"><Clock className="h-4 w-4 text-gray-500" /></div>
              <div>
                <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">Session Refresh Log</h2>
                <p className="text-xs text-gray-400 mt-0.5">History of refreshes in this session</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {log.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3 px-6 py-3.5">
                  {entry.status === "success" ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${entry.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {entry.status === "success" ? "Success" : "Failed"}
                      </span>
                      <span className="text-xs font-medium text-[#002244]">{entry.week_label} — Y{entry.year} W{entry.week_number}</span>
                      <span className="text-xs text-gray-400 font-mono">{entry.timestamp}</span>
                    </div>
                    {entry.sections && entry.sections.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.sections.map((s) => <span key={s} className="text-[10px] bg-blue-50 text-[#0085C3] px-1.5 py-0.5 rounded font-medium">{s}</span>)}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1 truncate">{entry.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
