"use client";

import { useState } from "react";
import Loader from "@/app/components/ui/Loader";
import { PackageX, Store, X } from "lucide-react";
import type { BottomSkuRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: BottomSkuRow[];
  loading: boolean;
}

export default function BottomSkusCard({ data, loading }: Props) {
  const [modal, setModal] = useState<{ skuName: string; stores: string[] } | null>(null);

  if (loading && data.length === 0) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PackageX className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
              Top 10 Zero-OSA SKUs &amp; Stores
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">Top {data.length} SKUs</span>
        </div>

        <div className="h-80 w-full mt-2">
          <div className="h-80 overflow-y-auto pr-1 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <Loader />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
                  <th className="pb-2.5 pt-1">SKU Name</th>
                  <th className="pb-2.5 pt-1 text-center">Zeros</th>
                  <th className="pb-2.5 pt-1 text-right">Stores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {data.length > 0 ? data.map((row, i) => (
                  <tr key={i} className="transition-colors hover:bg-red-50/50 text-gray-600">
                    <td className="py-2.5 pr-2 max-w-[200px]" title={row.sku_name}>
                      <div className="font-medium text-gray-800 truncate">{row.sku_name}</div>
                      <div className="text-[10px] text-gray-400">SAP: {row.sap_code}</div>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
                        {row.zero_count}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setModal({ skuName: row.sku_name, stores: row.store_names })}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Store className="h-3 w-3" />
                        <span>View ({row.store_names.length})</span>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400 text-xs">
                      No data for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stores modal */}
      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Stores with Zeros ({modal.stores.length})
                </span>
                <h3 className="text-base font-bold text-[#002244] mt-1 line-clamp-1">{modal.skuName}</h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 py-4 flex-1 space-y-2 divide-y divide-gray-50">
              {modal.stores.length > 0 ? modal.stores.map((name, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-center space-x-3 text-sm text-gray-700">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 text-xs font-semibold">
                    {idx + 1}
                  </div>
                  <span className="font-medium">{name}</span>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400 text-sm">No stores logged with zeros for this SKU.</div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl bg-[#002244] text-white text-xs font-semibold hover:bg-[#00172e] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
