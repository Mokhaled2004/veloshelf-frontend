"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchWithAuth } from "@/app/api";
import { usePogData } from "@/app/hooks/usePogData";

import PogKpiCards          from "./PogKpiCards";
import PogCountryCard       from "./PogCountryCard";
import PogCategoryCard      from "./PogCategoryCard";
import PogBrandCard         from "./PogBrandCard";
import PogTopBottomStoresCard from "./PogTopBottomStoresCard";
import PogLowCompliantCard  from "./PogLowCompliantCard";
import MultiSelectDropdown  from "@/app/components/ui/MultiSelectDropdown";
import { LayoutGrid, RotateCcw, Filter, ChevronUp } from "lucide-react";

interface FilterOptions {
  countries:  string[];
  channels:   string[];
  customers:  string[];
  categories: string[];
}

export default function PlanogramView() {
  // ── Filter options ────────────────────────────────────────────────────────
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    countries: [], channels: [], customers: [], categories: [],
  });

  useEffect(() => {
    fetchWithAuth("/pog/filter-options")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setFilterOptions(d); })
      .catch(() => {});
  }, []);

  // ── Active selections ─────────────────────────────────────────────────────
  const [selectedCountries,  setSelectedCountries]  = useState<string[]>([]);
  const [selectedChannels,   setSelectedChannels]   = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCustomers,  setSelectedCustomers]  = useState<string[]>([]);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const primaryCountry  = selectedCountries.length  === 1 ? selectedCountries[0]  : null;
  const primaryChannel  = selectedChannels.length   === 1 ? selectedChannels[0]   : null;
  const primaryCategory = selectedCategories.length === 1 ? selectedCategories[0] : null;
  const primaryCustomer = selectedCustomers.length  === 1 ? selectedCustomers[0]  : null;

  const filters = useMemo(
    () => ({
      country:  primaryCountry,
      channel:  primaryChannel,
      category: primaryCategory,
      customer: primaryCustomer,
      brand:    null,
    }),
    [primaryCountry, primaryChannel, primaryCategory, primaryCustomer]
  );

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, loading } = usePogData(filters);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleResetAll = () => {
    setSelectedCountries([]);
    setSelectedChannels([]);
    setSelectedCategories([]);
    setSelectedCustomers([]);
  };

  const hasFilters =
    selectedCountries.length  > 0 ||
    selectedChannels.length   > 0 ||
    selectedCategories.length > 0 ||
    selectedCustomers.length  > 0;

  return (
    <div className="space-y-6 pb-12 relative">

      {/* ── Sticky filter header ── */}
      <div className="sticky top-0 z-[100] bg-white pt-6 pb-4 px-10 overflow-visible">

        {/* Collapse toggle */}
        <div className="absolute right-10 top-4 z-[110]">
          <button
            onClick={() => setHeaderCollapsed(!headerCollapsed)}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#002244] hover:bg-gray-50 shadow-md transition-all duration-300"
            title={headerCollapsed ? "Expand Filters" : "Collapse Filters"}
          >
            <ChevronUp
              className={`h-4 w-4 transition-transform duration-300 ${headerCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3 pr-14">
            <div className="rounded-xl bg-blue-50 p-2 text-[#002244]">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#002244]">
              Planogram Compliance Analytics
            </h1>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-visible ${
              headerCollapsed
                ? "max-h-0 opacity-0 pointer-events-none"
                : "max-h-[1000px] opacity-100"
            }`}
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm overflow-visible">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-[#0085C3]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#002244]">
                    Global Analytics Filters
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {hasFilters && (
                    <>
                      <span className="text-xs font-semibold text-[#0085C3] bg-blue-50 px-2.5 py-0.5 rounded-full">
                        Filters Active
                      </span>
                      <button
                        onClick={handleResetAll}
                        className="flex items-center space-x-1.5 rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset All Filters</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-visible">
                <MultiSelectDropdown
                  label="Country"
                  options={filterOptions.countries}
                  selectedValues={selectedCountries}
                  onChange={setSelectedCountries}
                  placeholder="All Countries"
                />
                <MultiSelectDropdown
                  label="Channel"
                  options={filterOptions.channels}
                  selectedValues={selectedChannels}
                  onChange={setSelectedChannels}
                  placeholder="All Channels"
                />
                <MultiSelectDropdown
                  label="Nestle Category"
                  options={filterOptions.categories}
                  selectedValues={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="All Nestle Categories"
                />
                <MultiSelectDropdown
                  label="Customer / Account"
                  options={filterOptions.customers}
                  selectedValues={selectedCustomers}
                  onChange={setSelectedCustomers}
                  placeholder="All Customers"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-10 space-y-6">

        {/* Row 1 — 5 KPI number cards */}
        <PogKpiCards data={data.summary} loading={loading} />

        {/* Row 2 — by Country (1/3) + by Category (2/3) */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-stretch">
          <div className="md:col-span-1">
            <PogCountryCard data={data.byCountry} loading={loading} />
          </div>
          <div className="md:col-span-2">
            <PogCategoryCard
              data={data.byCategory}
              loading={loading}
              title="POG Compliance by Category"
            />
          </div>
        </div>

        {/* Row 3 — by Nestle Category (full width) */}
        <div className="grid gap-6 grid-cols-1">
          <PogCategoryCard
            data={data.byNestleCategory}
            loading={loading}
            title="POG Compliance by Nestle Category"
          />
        </div>

        {/* Row 4 — Low Compliant SKU + Low Compliant Store */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-stretch">
          <PogLowCompliantCard
            data={data.lowSkus}
            loading={loading}
            title="Low Compliant SKU"
            label="SKU"
          />
          <PogLowCompliantCard
            data={data.lowStores}
            loading={loading}
            title="Low Compliant Store"
            label="Store"
          />
        </div>

        {/* Row 5 — by Brand (full width grouped bar) */}
        <div className="grid gap-6 grid-cols-1">
          <PogBrandCard data={data.byBrand} loading={loading} />
        </div>

        {/* Row 6 — Top + Bottom stores */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-stretch">
          <PogTopBottomStoresCard data={data.topStores}    loading={loading} mode="top" />
          <PogTopBottomStoresCard data={data.bottomStores} loading={loading} mode="bottom" />
        </div>

      </div>
    </div>
  );
}
