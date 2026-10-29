"use client";

import Loader from "@/app/components/ui/Loader";
import { Users } from "lucide-react";
import type { AccountRow } from "@/app/hooks/useAvailabilityData";

interface Props {
  data: AccountRow[];
  loading: boolean;
  selectedAccount: string | null;
  onSelectAccount: (acc: string | null) => void;
}

export default function AccountTableCard({ data, loading, selectedAccount, onSelectAccount }: Props) {
  if (loading) {
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
            <Users className="h-4 w-4 text-[#0085C3]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#002244]">
              Account / Customer Performance
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">{data.length} Accounts</span>
        </div>

        <div className="h-80 overflow-y-auto pr-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
                <th className="pb-2.5">Account Name</th>
                <th className="pb-2.5 text-right">OSA %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {data.map((row) => {
                const isSelected = selectedAccount === row.account;
                const osaVal = Number(row.osa_percentage ?? 0).toFixed(2);
                return (
                  <tr
                    key={row.account}
                    onClick={() => onSelectAccount(isSelected ? null : row.account)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${
                      isSelected ? "bg-blue-50 font-semibold text-[#0085C3]" : "text-gray-600"
                    }`}
                  >
                    <td className="py-2.5 truncate max-w-[200px]" title={row.account}>
                      {row.account}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        row.osa_percentage < 60
                          ? "bg-red-50 text-red-600"
                          : row.osa_percentage < 75
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {osaVal}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
