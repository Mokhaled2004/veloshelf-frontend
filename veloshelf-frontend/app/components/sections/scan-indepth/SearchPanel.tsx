"use client";

import { useRef, useEffect } from "react";
import { Search, X, Barcode, Layers, Store, Loader2 } from "lucide-react";
import type { ScanMode, Suggestion } from "@/app/hooks/useScanIndepth";

interface Props {
  mode:        ScanMode;
  query:       string;
  suggestions: Suggestion[];
  quickSugg:   Suggestion[];
  searching:   boolean;
  onModeChange: (m: ScanMode) => void;
  onQueryChange: (q: string) => void;
  onSearch:    (id: string, label: string) => void;
  onClear:     () => void;
}

const MODES: { key: ScanMode; label: string; icon: React.ElementType; placeholder: string }[] = [
  { key: "sku",      label: "SKU",      icon: Barcode, placeholder: 'Search SKU name, SAP code or barcode…' },
  { key: "category", label: "Category", icon: Layers,  placeholder: 'Search category or Nestle category…' },
  { key: "store",    label: "Store",    icon: Store,   placeholder: 'Search store name or store code…' },
];

export default function SearchPanel({
  mode, query, suggestions, quickSugg, searching,
  onModeChange, onQueryChange, onSearch, onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const current  = MODES.find(m => m.key === mode)!;

  useEffect(() => { inputRef.current?.focus(); }, [mode]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && suggestions.length > 0) {
      onSearch(suggestions[0].id, suggestions[0].label);
    }
    if (e.key === "Escape") onClear();
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">

      {/* ── Mode toggle ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          1. Choose target entity type
        </p>
        <div className="flex gap-2 p-1 rounded-2xl bg-gray-100">
          {MODES.map(m => {
            const Icon    = m.icon;
            const active  = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => onModeChange(m.key)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#002244] text-white shadow-md"
                    : "text-gray-500 hover:text-[#002244] hover:bg-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search box ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          2. Enter {current.label} name or code
        </p>
        <div className="relative">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-[#0085C3] transition-colors">
            {searching
              ? <Loader2 className="h-4 w-4 text-[#0085C3] animate-spin shrink-0" />
              : <Search className="h-4 w-4 text-gray-400 shrink-0" />
            }
            <input
              ref={inputRef}
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={handleKey}
              placeholder={current.placeholder}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            {query && (
              <button onClick={onClear} className="shrink-0 rounded-full p-1 hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => {
                if (suggestions.length > 0) onSearch(suggestions[0].id, suggestions[0].label);
                else if (query.trim()) onSearch(query.trim(), query.trim());
              }}
              className="shrink-0 rounded-xl bg-[#002244] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#003366] transition-colors"
            >
              Search →
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
              {suggestions.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSearch(s.id, s.label)}
                  className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <current.icon className="h-4 w-4 text-[#0085C3] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#002244] truncate">{s.label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.sub}{s.category ? ` · ${s.category}` : ""}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick suggestions ── */}
      {quickSugg.length > 0 && !query && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 mb-2">Quick Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {quickSugg.map(s => (
              <button
                key={s.id}
                onClick={() => onSearch(s.id, s.label)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#0085C3] hover:text-[#0085C3] hover:bg-blue-50 transition-all"
              >
                <span className="text-[#0085C3] font-bold">+</span>
                {s.label}
                {s.sub !== s.label && <span className="text-gray-400 ml-1">({s.sub})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Scanning real-time inventory balances across all active scan records.
        </div>
        <span className="font-mono">v1.0 Live</span>
      </div>
    </div>
  );
}
