"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchWithAuth } from "@/app/api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SodSummary {
  sod_percentage: number;
  total_records:  number;
  message?:       string;
}
export interface SodCountryRow    { country: string;      sod_percentage: number; total_records: number; }
export interface SodChannelRow    { channel: string;      sod_percentage: number; total_records: number; }
export interface SodDisplayTypeRow{ display_type: string; sod_percentage: number; total_records: number; }
export interface SodCategoryRow   { category: string;     sod_percentage: number; total_records: number; }
export interface SodAccountRow    { account: string;      sod_percentage: number; total_records: number; }
export interface SodStoreRow      { store_name: string;   sod_percentage: number; total_records: number; }
export interface SodDrilldownRow  { name: string;         sod_percentage: number; total_records: number; }

export interface ShareOfDisplayData {
  summary:       SodSummary | null;
  byCountry:     SodCountryRow[];
  byChannel:     SodChannelRow[];
  byDisplayType: SodDisplayTypeRow[];
  byCategory:    SodCategoryRow[];
  byAccount:     SodAccountRow[];
  topStores:     SodStoreRow[];
  bottomStores:  SodStoreRow[];
  drilldown:     SodDrilldownRow[];
}

export interface SodFilters {
  country: string | null; channel: string | null;
  category: string | null; account: string | null; displayType: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY: ShareOfDisplayData = {
  summary: null, byCountry: [], byChannel: [], byDisplayType: [],
  byCategory: [], byAccount: [], topStores: [], bottomStores: [], drilldown: [],
};

function buildParams(f: SodFilters): string {
  const p = new URLSearchParams();
  if (f.country)     p.append("country",      f.country);
  if (f.channel)     p.append("channel",      f.channel);
  if (f.category)    p.append("category",     f.category);
  if (f.account)     p.append("account",      f.account);
  if (f.displayType) p.append("display_type", f.displayType);
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function safeFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetchWithAuth(endpoint);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useShareOfDisplayData(filters: SodFilters) {
  const [data, setData]                         = useState<ShareOfDisplayData>(EMPTY);
  const [loading, setLoading]                   = useState(true);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (f: SodFilters) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    const qs         = buildParams(f);
    const noCountry  = buildParams({ ...f, country:     null });
    const noChannel  = buildParams({ ...f, channel:     null });
    const noCategory = buildParams({ ...f, category:    null });
    const noAccount  = buildParams({ ...f, account:     null });
    const noDisp     = buildParams({ ...f, displayType: null });

    const [summary, byCountry, byChannel, byDisplayType, byCategory, byAccount, topStores, bottomStores] =
      await Promise.allSettled([
        safeFetch<SodSummary>        (`/sod/summary${qs}`),
        safeFetch<SodCountryRow[]>   (`/sod/by-country${noCountry}`),
        safeFetch<SodChannelRow[]>   (`/sod/by-channel${noChannel}`),
        safeFetch<SodDisplayTypeRow[]>(`/sod/by-display-type${noDisp}`),
        safeFetch<SodCategoryRow[]>  (`/sod/by-category${noCategory}`),
        safeFetch<SodAccountRow[]>   (`/sod/by-account${noAccount}`),
        safeFetch<SodStoreRow[]>     (`/sod/top-stores${qs}`),
        safeFetch<SodStoreRow[]>     (`/sod/bottom-stores${qs}`),
      ]);

    if (ctrl.signal.aborted) return;

    const get = <T>(r: PromiseSettledResult<T | null>, fb: T): T =>
      r.status === "fulfilled" && r.value !== null ? r.value : fb;

    setData({
      summary:       get(summary,       null),
      byCountry:     get(byCountry,     []),
      byChannel:     get(byChannel,     []),
      byDisplayType: get(byDisplayType, []),
      byCategory:    get(byCategory,    []),
      byAccount:     get(byAccount,     []),
      topStores:     get(topStores,     []),
      bottomStores:  get(bottomStores,  []),
      drilldown:     [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll(filters);
  }, [filters.country, filters.channel, filters.category, filters.account, filters.displayType, fetchAll]);

  const loadDrilldown = useCallback(async (params: { country?: string; channel?: string }) => {
    setDrilldownLoading(true);
    const p = new URLSearchParams();
    if (params.country) p.append("country", params.country);
    if (params.channel) p.append("channel", params.channel);
    const result = await safeFetch<SodDrilldownRow[]>(`/sod/drilldown?${p.toString()}`);
    setData((prev) => ({ ...prev, drilldown: result ?? [] }));
    setDrilldownLoading(false);
  }, []);

  const clearDrilldown = useCallback(() => {
    setData((prev) => ({ ...prev, drilldown: [] }));
  }, []);

  return { data, loading, drilldownLoading, loadDrilldown, clearDrilldown };
}
