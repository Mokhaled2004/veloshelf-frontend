"use client";

/**
 * usePogData
 *
 * Fires all 9 POG Compliance API calls in a single parallel batch via
 * Promise.allSettled whenever filters change. Cards receive pre-fetched
 * data as props — no card fetches independently.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchWithAuth } from "@/app/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PogSummary {
  pog_compliance_pct:    number;
  osa_pct:               number;
  facings_pct:           number;
  product_placement_pct: number;
  assortment_pct:        number;
  total_records:         number;
  message?:              string;
}

export interface PogCountryRow {
  country:               string;
  pog_compliance_pct:    number;
  osa_pct:               number;
  facings_pct:           number;
  product_placement_pct: number;
  assortment_pct:        number;
  total_records:         number;
}

export interface PogChannelRow {
  channel:               string;
  pog_compliance_pct:    number;
  osa_pct:               number;
  facings_pct:           number;
  product_placement_pct: number;
  assortment_pct:        number;
  total_records:         number;
}

export interface PogCategoryRow {
  category:              string;
  pog_compliance_pct:    number;
  osa_pct:               number;
  facings_pct:           number;
  product_placement_pct: number;
  assortment_pct:        number;
  total_records:         number;
}

export interface PogBrandRow {
  brand:                 string;
  pog_compliance_pct:    number;
  osa_pct:               number;
  facings_pct:           number;
  product_placement_pct: number;
  assortment_pct:        number;
  total_records:         number;
}

export interface PogStoreRow {
  store_name:            string;
  country:               string;
  pog_compliance_pct:    number;
  osa_pct:               number;
  facings_pct:           number;
  product_placement_pct: number;
  assortment_pct:        number;
  total_records:         number;
}

export interface PogLowRow {
  name:               string;
  country?:           string;
  pog_compliance_pct: number;
  total_records:      number;
}

export interface PogData {
  summary:          PogSummary | null;
  byCountry:        PogCountryRow[];
  byChannel:        PogChannelRow[];
  byCategory:       PogCategoryRow[];
  byNestleCategory: PogCategoryRow[];
  byBrand:          PogBrandRow[];
  topStores:        PogStoreRow[];
  bottomStores:     PogStoreRow[];
  lowSkus:          PogLowRow[];
  lowStores:        PogLowRow[];
}

export interface PogFilters {
  country:  string | null;
  channel:  string | null;
  category: string | null;
  customer: string | null;
  brand:    string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY: PogData = {
  summary:          null,
  byCountry:        [],
  byChannel:        [],
  byCategory:       [],
  byNestleCategory: [],
  byBrand:          [],
  topStores:        [],
  bottomStores:     [],
  lowSkus:          [],
  lowStores:        [],
};

function buildParams(f: PogFilters): string {
  const p = new URLSearchParams();
  if (f.country)  p.append("country",  f.country);
  if (f.channel)  p.append("channel",  f.channel);
  if (f.category) p.append("category", f.category);
  if (f.customer) p.append("customer", f.customer);
  if (f.brand)    p.append("brand",    f.brand);
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

export function usePogData(filters: PogFilters) {
  const [data, setData]       = useState<PogData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (f: PogFilters) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    const qs          = buildParams(f);
    const noCountry   = buildParams({ ...f, country:  null });
    const noChannel   = buildParams({ ...f, channel:  null });
    const noCategory  = buildParams({ ...f, category: null });
    const noBrand     = buildParams({ ...f, brand:    null });

    const [
      summary,
      byCountry,
      byChannel,
      byCategory,
      byNestleCategory,
      byBrand,
      topStores,
      bottomStores,
      lowSkus,
      lowStores,
    ] = await Promise.allSettled([
      safeFetch<PogSummary>(`/pog/summary${qs}`),
      safeFetch<PogCountryRow[]>(`/pog/by-country${noCountry}`),
      safeFetch<PogChannelRow[]>(`/pog/by-channel${noChannel}`),
      safeFetch<PogCategoryRow[]>(`/pog/by-category${noCategory}`),
      safeFetch<PogCategoryRow[]>(`/pog/by-nestle-category${noCategory}`),
      safeFetch<PogBrandRow[]>(`/pog/by-brand${noBrand}`),
      safeFetch<PogStoreRow[]>(`/pog/top-stores${qs}`),
      safeFetch<PogStoreRow[]>(`/pog/bottom-stores${qs}`),
      safeFetch<PogLowRow[]>(`/pog/low-compliant-skus${qs}`),
      safeFetch<PogLowRow[]>(`/pog/low-compliant-stores${qs}`),
    ]);

    if (ctrl.signal.aborted) return;

    const get = <T>(r: PromiseSettledResult<T | null>, fallback: T): T =>
      r.status === "fulfilled" && r.value !== null ? r.value : fallback;

    setData({
      summary:          get(summary,          null),
      byCountry:        get(byCountry,        []),
      byChannel:        get(byChannel,        []),
      byCategory:       get(byCategory,       []),
      byNestleCategory: get(byNestleCategory, []),
      byBrand:          get(byBrand,          []),
      topStores:        get(topStores,        []),
      bottomStores:     get(bottomStores,     []),
      lowSkus:          get(lowSkus,          []),
      lowStores:        get(lowStores,        []),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll(filters);
  }, [
    filters.country, filters.channel, filters.category,
    filters.customer, filters.brand, fetchAll,
  ]);

  return { data, loading };
}
