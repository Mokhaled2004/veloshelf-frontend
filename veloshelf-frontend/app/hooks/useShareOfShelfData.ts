"use client";

/**
 * useShareOfShelfData
 *
 * Fires all 8 SOS API calls in a single parallel batch via Promise.allSettled.
 * Cards receive pre-fetched data as props — no card ever fetches independently.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchWithAuth } from "@/app/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SosSummary {
  sos_percentage: number;
  total_records:  number;
  message?:       string;
}

export interface SosCountryRow {
  country:        string;
  sos_percentage: number;
  total_records:  number;
}

export interface SosChannelRow {
  channel:        string;
  sos_percentage: number;
  total_records:  number;
}

export interface SosDisplayTypeRow {
  display_type:   string;
  sos_percentage: number;
  total_records:  number;
}

export interface SosCategoryRow {
  category:       string;
  sos_percentage: number;
  total_records:  number;
}

export interface SosAccountRow {
  account:        string;
  sos_percentage: number;
  total_records:  number;
}

export interface SosStoreRow {
  store_name:     string;
  sos_percentage: number;
  total_records:  number;
}

export interface SosDrilldownRow {
  name:           string;
  sos_percentage: number;
  total_records:  number;
}

export interface ShareOfShelfData {
  summary:       SosSummary | null;
  byCountry:     SosCountryRow[];
  byChannel:     SosChannelRow[];
  byDisplayType: SosDisplayTypeRow[];
  byCategory:    SosCategoryRow[];
  byAccount:     SosAccountRow[];
  topStores:     SosStoreRow[];
  bottomStores:  SosStoreRow[];
  drilldown:     SosDrilldownRow[];
}

export interface SosFilters {
  country:     string | null;
  channel:     string | null;
  category:    string | null;
  account:     string | null;
  displayType: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY: ShareOfShelfData = {
  summary:       null,
  byCountry:     [],
  byChannel:     [],
  byDisplayType: [],
  byCategory:    [],
  byAccount:     [],
  topStores:     [],
  bottomStores:  [],
  drilldown:     [],
};

function buildParams(f: SosFilters): string {
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
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useShareOfShelfData(filters: SosFilters) {
  const [data, setData]                   = useState<ShareOfShelfData>(EMPTY);
  const [loading, setLoading]             = useState(true);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (f: SosFilters) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    const qs          = buildParams(f);
    const noCountry   = buildParams({ ...f, country:     null });
    const noChannel   = buildParams({ ...f, channel:     null });
    const noCategory  = buildParams({ ...f, category:    null });
    const noAccount   = buildParams({ ...f, account:     null });
    const noDispType  = buildParams({ ...f, displayType: null });

    const [
      summary,
      byCountry,
      byChannel,
      byDisplayType,
      byCategory,
      byAccount,
      topStores,
      bottomStores,
    ] = await Promise.allSettled([
      safeFetch<SosSummary>(`/sos/summary${qs}`),
      safeFetch<SosCountryRow[]>(`/sos/by-country${noCountry}`),
      safeFetch<SosChannelRow[]>(`/sos/by-channel${noChannel}`),
      safeFetch<SosDisplayTypeRow[]>(`/sos/by-display-type${noDispType}`),
      safeFetch<SosCategoryRow[]>(`/sos/by-category${noCategory}`),
      safeFetch<SosAccountRow[]>(`/sos/by-account${noAccount}`),
      safeFetch<SosStoreRow[]>(`/sos/top-stores${qs}`),
      safeFetch<SosStoreRow[]>(`/sos/bottom-stores${qs}`),
    ]);

    if (ctrl.signal.aborted) return;

    const get = <T>(r: PromiseSettledResult<T | null>, fallback: T): T =>
      r.status === "fulfilled" && r.value !== null ? r.value : fallback;

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

  const loadDrilldown = useCallback(
    async (params: { country?: string; channel?: string }) => {
      setDrilldownLoading(true);
      const p = new URLSearchParams();
      if (params.country) p.append("country", params.country);
      if (params.channel) p.append("channel", params.channel);
      const result = await safeFetch<SosDrilldownRow[]>(`/sos/drilldown?${p.toString()}`);
      setData((prev) => ({ ...prev, drilldown: result ?? [] }));
      setDrilldownLoading(false);
    },
    []
  );

  const clearDrilldown = useCallback(() => {
    setData((prev) => ({ ...prev, drilldown: [] }));
  }, []);

  return { data, loading, drilldownLoading, loadDrilldown, clearDrilldown };
}
