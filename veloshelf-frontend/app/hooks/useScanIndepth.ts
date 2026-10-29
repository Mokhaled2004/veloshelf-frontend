"use client";
import { useState, useCallback, useRef } from "react";
import { fetchWithAuth } from "@/app/api";

export type ScanMode = "sku" | "category" | "store";

export interface Suggestion { id: string; label: string; sub: string; barcode?: string; category?: string; }

// ── SKU detail types ──────────────────────────────────────────────────────────
export interface SkuMeta { sap_code: string; sku_name: string; barcode: string; category: string; nestle_category: string; }
export interface SkuKpi  { osa_pct: number; oos_rate: number; total_checks: number; avail_checks: number; total_stores: number; in_stock_stores: number; oos_stores: number; }
export interface TrendPoint { week: string; osa_pct: number; }
export interface CountryRow { country: string; osa_pct: number; total: number; }
export interface ChannelRow { channel: string; osa_pct: number; total: number; }
export interface OosStore   { store_code: string; store_name: string; country: string; osa_pct: number; total_checks: number; }
export interface PogMetrics { pog_compliance_pct: number | null; osa_pct: number | null; facings_pct: number | null; product_placement_pct: number | null; assortment_pct: number | null; }
export interface SkuResult  { meta: SkuMeta; last_scan: string | null; kpi: SkuKpi; trend: TrendPoint[]; by_country: CountryRow[]; by_channel: ChannelRow[]; oos_stores: OosStore[]; pog: PogMetrics | null; suggestions: string[]; }

// ── Category detail types ─────────────────────────────────────────────────────
export interface CatMeta   { category: string; nestle_category: string; }
export interface CatKpi    { osa_pct: number; oos_rate: number; total_checks: number; total_skus: number; total_stores: number; }
export interface SkuRow    { sap_code: string; sku_name: string; osa_pct: number; total: number; }
export interface CatResult { meta: CatMeta; kpi: CatKpi; top_skus: SkuRow[]; bottom_skus: SkuRow[]; by_country: CountryRow[]; by_channel: ChannelRow[]; trend: TrendPoint[]; pog: PogMetrics | null; suggestions: string[]; }

// ── Store detail types ────────────────────────────────────────────────────────
export interface StoreMeta   { store_code: string; store_name: string; }
export interface StoreKpi    { osa_pct: number; oos_rate: number; total_checks: number; total_skus: number; total_cats: number; }
export interface CatOsaRow   { category: string; osa_pct: number; total: number; }
export interface OosSku      { sap_code: string; sku_name: string; category: string; osa_pct: number; total: number; }
export interface StoreResult { meta: StoreMeta; last_scan: string | null; kpi: StoreKpi; by_category: CatOsaRow[]; oos_skus: OosSku[]; trend: TrendPoint[]; pog: PogMetrics | null; suggestions: string[]; }

export type ScanResult = { mode: "sku"; data: SkuResult } | { mode: "category"; data: CatResult } | { mode: "store"; data: StoreResult };

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetchWithAuth(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

export function useScanIndepth() {
  const [mode,        setMode]        = useState<ScanMode>("sku");
  const [query,       setQuery]       = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [quickSugg,   setQuickSugg]   = useState<Suggestion[]>([]);
  const [result,      setResult]      = useState<ScanResult | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [searching,   setSearching]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load quick suggestions when mode changes
  const loadQuickSuggestions = useCallback(async (m: ScanMode) => {
    const data = await safeFetch<Suggestion[]>(`/scan/quick-suggestions?mode=${m}`);
    setQuickSugg(data ?? []);
  }, []);

  const changeMode = useCallback((m: ScanMode) => {
    setMode(m);
    setQuery("");
    setSuggestions([]);
    setResult(null);
    setError(null);
    loadQuickSuggestions(m);
  }, [loadQuickSuggestions]);

  // Debounced autocomplete
  const onQueryChange = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const data = await safeFetch<Suggestion[]>(`/scan/search?mode=${mode}&q=${encodeURIComponent(q)}`);
      setSuggestions(data ?? []);
      setSearching(false);
    }, 250);
  }, [mode]);

  // Execute full search
  const search = useCallback(async (id: string, label: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setQuery(label);
    setSuggestions([]);

    try {
      if (mode === "sku") {
        const data = await safeFetch<SkuResult>(`/scan/sku?id=${encodeURIComponent(id)}`);
        if (data) setResult({ mode: "sku", data });
        else setError("SKU not found or no data available.");
      } else if (mode === "category") {
        const data = await safeFetch<CatResult>(`/scan/category?id=${encodeURIComponent(id)}`);
        if (data) setResult({ mode: "category", data });
        else setError("Category not found or no data available.");
      } else {
        const data = await safeFetch<StoreResult>(`/scan/store?id=${encodeURIComponent(id)}`);
        if (data) setResult({ mode: "store", data });
        else setError("Store not found or no data available.");
      }
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const clearResult = useCallback(() => {
    setResult(null);
    setQuery("");
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    mode, query, suggestions, quickSugg, result, loading, searching, error,
    changeMode, onQueryChange, search, clearResult, loadQuickSuggestions,
  };
}
