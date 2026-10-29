"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchWithAuth } from "@/app/api";
import { useAvailabilityData } from "@/app/hooks/useAvailabilityData";

import OsaCard from "./OsaCard";
import CountryBreakdownCard from "./CountryBreakdownCard";
import ChannelBreakdownCard from "./ChannelBreakdownCard";
import DisplayTypeBreakdownCard from "./DisplayTypeBreakdownCard";
import CategoryBreakdownCard from "./CategoryBreakdownCard";
import AccountTableCard from "./AccountTableCard";
import TopStoresCard from "./TopStoresCard";
import BottomStoresCard from "./BottomStoresCard";
import TopSkusCard from "./TopSkusCard";
import BottomSkusCard from "./BottomSkusCard";
import MultiSelectDropdown from "@/app/components/ui/MultiSelectDropdown";
import { Package, RotateCcw, Filter, ChevronUp } from "lucide-react";

export default function AvailabilityView() {
  // ── Filter options (dropdown lists) ─────────────────────────────────────
  const [filterOptions, setFilterOptions] = useState<{
    countries: string[];
    channels: string[];
    categories: string[];
    accounts: string[];
    display_types: string[];
  }>({ countries: [], channels: [], categories: [], accounts: [], display_types: [] });

  useEffect(() => {
    // fetchWithAuth already redirects to /sign-in on 401.
    // We catch silently here so a network hiccup or expired token during
    // the filter-options prefetch never surfaces as a console error.
    fetchWithAuth("/availability/filter-options")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setFilterOptions(d); })
      .catch(() => {/* handled by fetchWithAuth redirect */});
  }, []);

  // ── Active filter selections ─────────────────────────────────────────────
  const [selectedCountries,    setSelectedCountries]    = useState<string[]>([]);
  const [selectedChannels,     setSelectedChannels]     = useState<string[]>([]);
  const [selectedCategories,   setSelectedCategories]   = useState<string[]>([]);
  const [selectedAccounts,     setSelectedAccounts]     = useState<string[]>([]);
  const [selectedDisplayTypes, setSelectedDisplayTypes] = useState<string[]>([]);

  // ── Drilldown state ──────────────────────────────────────────────────────
  const [drilledCountry, setDrilledCountry] = useState<string | null>(null);
  const [drilledChannel, setDrilledChannel] = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // ── Collapse to single values for the data hook ─────────────────────────
  const primaryCountry     = selectedCountries.length    === 1 ? selectedCountries[0]    : null;
  const primaryChannel     = selectedChannels.length     === 1 ? selectedChannels[0]     : null;
  const primaryCategory    = selectedCategories.length   === 1 ? selectedCategories[0]   : null;
  const primaryAccount     = selectedAccounts.length     === 1 ? selectedAccounts[0]     : null;
  const primaryDisplayType = selectedDisplayTypes.length === 1 ? selectedDisplayTypes[0] : null;

  // Stable filters object — only recreated when a value actually changes
  const filters = useMemo(
    () => ({
      country:     primaryCountry,
      channel:     primaryChannel,
      category:    primaryCategory,
      account:     primaryAccount,
      displayType: primaryDisplayType,
    }),
    [primaryCountry, primaryChannel, primaryCategory, primaryAccount, primaryDisplayType]
  );

  // ── Single shared data fetch ─────────────────────────────────────────────
  const { data, loading, drilldownLoading, loadDrilldown, clearDrilldown } =
    useAvailabilityData(filters);

  // ── Drilldown handlers ───────────────────────────────────────────────────
  const handleDrillCountry = (country: string) => {
    setDrilledCountry(country);
    loadDrilldown({ country });
  };
  const handleDrillChannel = (channel: string) => {
    setDrilledChannel(channel);
    loadDrilldown({ channel });
  };
  const handleResetDrillCountry = () => { setDrilledCountry(null); clearDrilldown(); };
  const handleResetDrillChannel = () => { setDrilledChannel(null); clearDrilldown(); };

  // ── Global reset ─────────────────────────────────────────────────────────
  const handleResetAllFilters = () => {
    setSelectedCountries([]);
    setSelectedChannels([]);
    setSelectedCategories([]);
    setSelectedAccounts([]);
    setSelectedDisplayTypes([]);
    setDrilledCountry(null);
    setDrilledChannel(null);
    clearDrilldown();
  };

  const hasGlobalFilters =
    selectedCountries.length > 0 ||
    selectedChannels.length  > 0 ||
    selectedCategories.length > 0 ||
    selectedAccounts.length  > 0 ||
    selectedDisplayTypes.length > 0 ||
    drilledCountry || drilledChannel;

  return (
    <div className="space-y-6 pb-12 relative">

      {/* ── Sticky filter header ── */}
      <div className="sticky top-0 z-[100] bg-white pt-6 pb-4 px-10 overflow-visible">

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
              <Package className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#002244]">
              Availability Analytics
            </h1>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-visible ${
              headerCollapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[1000px] opacity-100"
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
                  {hasGlobalFilters && (
                    <>
                      <span className="text-xs font-semibold text-[#0085C3] bg-blue-50 px-2.5 py-0.5 rounded-full">
                        Filters Active
                      </span>
                      <button
                        onClick={handleResetAllFilters}
                        className="flex items-center space-x-1.5 rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset All Filters</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 overflow-visible">
                <MultiSelectDropdown
                  label="Country"
                  options={filterOptions.countries}
                  selectedValues={selectedCountries}
                  onChange={(v) => { setSelectedCountries(v); setDrilledCountry(null); clearDrilldown(); }}
                  placeholder="All Countries"
                />
                <MultiSelectDropdown
                  label="Channel"
                  options={filterOptions.channels}
                  selectedValues={selectedChannels}
                  onChange={(v) => { setSelectedChannels(v); setDrilledChannel(null); clearDrilldown(); }}
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
                  label="Account"
                  options={filterOptions.accounts}
                  selectedValues={selectedAccounts}
                  onChange={setSelectedAccounts}
                  placeholder="All Accounts"
                />
                <div className="col-span-2 md:col-span-1">
                  <MultiSelectDropdown
                    label="Display Type"
                    options={filterOptions.display_types}
                    selectedValues={selectedDisplayTypes}
                    onChange={setSelectedDisplayTypes}
                    placeholder="All Displays"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="px-10 space-y-6">

        {/* Row 1 */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-stretch">
          <OsaCard
            data={data.summary}
            loading={loading}
            selectedCountry={primaryCountry}
            selectedChannel={primaryChannel}
            selectedCategory={primaryCategory}
            selectedAccount={primaryAccount}
            selectedDisplayType={primaryDisplayType}
            onResetFilter={handleResetAllFilters}
          />
          <CountryBreakdownCard
            data={drilledCountry ? data.drilldown : data.byCountry}
            loading={loading || (!!drilledCountry && drilldownLoading)}
            selectedCountry={primaryCountry}
            drilledCountry={drilledCountry}
            onSelectCountry={(c) => setSelectedCountries(c ? [c] : [])}
            onDrillDown={handleDrillCountry}
            onResetDrill={handleResetDrillCountry}
          />
          <ChannelBreakdownCard
            data={drilledChannel ? data.drilldown : data.byChannel}
            loading={loading || (!!drilledChannel && drilldownLoading)}
            selectedChannel={primaryChannel}
            drilledChannel={drilledChannel}
            onSelectChannel={(c) => setSelectedChannels(c ? [c] : [])}
            onDrillDown={handleDrillChannel}
            onResetDrill={handleResetDrillChannel}
          />
        </div>

        {/* Row 2 */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-stretch">
          <DisplayTypeBreakdownCard
            data={data.byDisplayType}
            loading={loading}
            selectedDisplayType={primaryDisplayType}
            onSelectDisplayType={(dt) => setSelectedDisplayTypes(dt ? [dt] : [])}
          />
          <CategoryBreakdownCard
            data={data.byCategory}
            loading={loading}
            selectedCategory={primaryCategory}
            onSelectCategory={(c) => setSelectedCategories(c ? [c] : [])}
          />
          <AccountTableCard
            data={data.byAccount}
            loading={loading}
            selectedAccount={primaryAccount}
            onSelectAccount={(a) => setSelectedAccounts(a ? [a] : [])}
          />
        </div>

        {/* Row 3 — Top / Bottom Stores */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-stretch">
          <TopStoresCard    data={data.topStores}    loading={loading} />
          <BottomStoresCard data={data.bottomStores} loading={loading} />
        </div>

        {/* Row 4 — Top / Bottom SKUs */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-stretch">
          <TopSkusCard    data={data.topSkus}    loading={loading} />
          <BottomSkusCard data={data.bottomSkus} loading={loading} />
        </div>

      </div>
    </div>
  );
}
