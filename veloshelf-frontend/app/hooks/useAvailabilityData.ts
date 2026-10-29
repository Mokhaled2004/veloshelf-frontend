"use client";

/**
 * useAvailabilityData
 *
 * Fires all 9 availability API calls in a single parallel batch whenever the
 * active filter set changes.  Every card in the Availability section receives
 * its slice of this shared state as a prop — no card ever fetches on its own,
 * eliminating the N-waterfall that caused the lag.
 *
 * Filter params are identical to what each card used to send individually;
 * they are just assembled once here.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchWithAuth } from "@/app/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OsaSummary {
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
  user_tier?: number;
  is_unrestricted?: boolean;
  message?: string;
}

export interface CountryRow {
  country: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface ChannelRow {
  channel: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface DisplayTypeRow {
  display_type: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface CategoryRow {
  category: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface AccountRow {
  account: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface StoreRow {
  store_name: string;
  store_code: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface DrilldownRow {
  name: string;
  store_code: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface SkuRow {
  sku_name: string;
  sap_code: string;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
}

export interface BottomSkuRow {
  sku_name: string;
  sap_code: string;
  zero_count: number;
  osa_percentage: number;
  total_checks: number;
  available_checks: number;
  store_names: string[];
}

export interface AvailabilityData {
  summary:          OsaSummary | null;
  byCountry:        CountryRow[];
  byChannel:        ChannelRow[];
  byDisplayType:    DisplayTypeRow[];
  byCategory:       CategoryRow[];
  byAccount:        AccountRow[];
  topStores:        StoreRow[];
  bottomStores:     StoreRow[];
  topSkus:          SkuRow[];
  bottomSkus:       BottomSkuRow[];
  // drilldown results (loaded on demand, not in the main batch)
  drilldown:        DrilldownRow[];
}

export interface AvailabilityFilters {
  country:      string | null;
  channel:      string | null;
  category:     string | null;
  account:      string | null;
  displayType:  string | null;
}

interface UseAvailabilityDataReturn {
  data: AvailabilityData;
  loading: boolean;
  drilldownLoading: boolean;
  loadDrilldown: (params: { country?: string; channel?: string }) => void;
  clearDrilldown: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY: AvailabilityData = {
  summary:       null,
  byCountry:     [],
  byChannel:     [],
  byDisplayType: [],
  byCategory:    [],
  byAccount:     [],
  topStores:     [],
  bottomStores:  [],
  topSkus:       [],
  bottomSkus:    [],
  drilldown:     [],
};

function buildParams(filters: AvailabilityFilters): string {
  const p = new URLSearchParams();
  if (filters.country)     p.append("country",       filters.country);
  if (filters.channel)     p.append("channel",       filters.channel);
  if (filters.category)    p.append("category",      filters.category);
  if (filters.account)     p.append("account",       filters.account);
  if (filters.displayType) p.append("display_type",  filters.displayType);
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function safeFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetchWithAuth(endpoint);
    // fetchWithAuth throws on 401 (redirects to sign-in) — caught below.
    // Any other non-ok status we treat as empty data rather than crashing.
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network error, CORS-blocked response, or 401 redirect — all silent.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAvailabilityData(
  filters: AvailabilityFilters
): UseAvailabilityDataReturn {
  const [data, setData] = useState<AvailabilityData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // AbortController ref so we can cancel in-flight fetches on filter change
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (f: AvailabilityFilters) => {
    // Cancel any previous in-flight batch
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);

    const qs   = buildParams(f);

    // Build per-endpoint query strings that exclude the dimension being grouped
    const noCountry      = buildParams({ ...f, country: null });
    const noChannel      = buildParams({ ...f, channel: null });
    const noCategory     = buildParams({ ...f, category: null });
    const noAccount      = buildParams({ ...f, account: null });
    const noDisplayType  = buildParams({ ...f, displayType: null });

    const [
      summary,
      byCountry,
      byChannel,
      byDisplayType,
      byCategory,
      byAccount,
      topStores,
      bottomStores,
      topSkus,
      bottomSkus,
    ] = await Promise.allSettled([
      safeFetch<OsaSummary>(`/availability/osa-summary${qs}`),
      safeFetch<CountryRow[]>(`/availability/osa-by-country${noCountry}`),
      safeFetch<ChannelRow[]>(`/availability/osa-by-channel${noChannel}`),
      safeFetch<DisplayTypeRow[]>(`/availability/osa-by-display-type${noDisplayType}`),
      safeFetch<CategoryRow[]>(`/availability/osa-by-category${noCategory}`),
      safeFetch<AccountRow[]>(`/availability/osa-by-account${noAccount}`),
      safeFetch<StoreRow[]>(`/availability/osa-top-stores${qs}`),
      safeFetch<StoreRow[]>(`/availability/osa-bottom-stores${qs}`),
      safeFetch<SkuRow[]>(`/availability/osa-top-skus${qs}`),
      safeFetch<{ items: BottomSkuRow[] }>(`/availability/osa-bottom-skus${qs}`),
    ]);

    // Abort check — if a newer fetch already started, discard these results
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
      topSkus:       get(topSkus,       []),
      bottomSkus:    (get(bottomSkus, { items: [] }) as { items: BottomSkuRow[] }).items,
      drilldown:     [],
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll(filters);
  }, [filters.country, filters.channel, filters.category, filters.account, filters.displayType, fetchAll]);

  // ---- On-demand drilldown (country or channel drill) --------------------
  const loadDrilldown = useCallback(
    async (params: { country?: string; channel?: string }) => {
      setDrilldownLoading(true);
      const p = new URLSearchParams();
      if (params.country) p.append("country", params.country);
      if (params.channel) p.append("channel", params.channel);
      const result = await safeFetch<DrilldownRow[]>(
        `/availability/osa-drilldown?${p.toString()}`
      );
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
