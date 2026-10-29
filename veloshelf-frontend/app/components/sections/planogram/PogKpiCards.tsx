"use client";

/**
 * PogKpiCards — Row of 5 animated number cards.
 * Layout matches the image: POG Compliance | Assortment | Product Placement | OSA | Facings Score
 */

import { useEffect, useState } from "react";
import Loader from "@/app/components/ui/Loader";
import type { PogSummary } from "@/app/hooks/usePogData";

interface Props {
  data:    PogSummary | null;
  loading: boolean;
}

function pctColor(v: number) {
  if (v < 40)  return "text-red-500";
  if (v < 65)  return "text-amber-500";
  return "text-green-500";
}

function AnimatedPct({ target }: { target: number }) {
  const [display, setDisplay] = useState("0.00");

  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p    = Math.min((ts - start) / 900, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay((ease * target).toFixed(2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);

  return (
    <span className={`text-5xl font-black tracking-tighter transition-colors duration-300 ${pctColor(target)}`}>
      {display}
      <span className="text-3xl font-extrabold">%</span>
    </span>
  );
}

interface KpiDef {
  label: string;
  key:   keyof Omit<PogSummary, "total_records" | "message">;
}

const KPIS: KpiDef[] = [
  { label: "POG Compliance",     key: "pog_compliance_pct" },
  { label: "Assortment",         key: "assortment_pct" },
  { label: "Product Placement",  key: "product_placement_pct" },
  { label: "OSA",                key: "osa_pct" },
  { label: "Facings Score",      key: "facings_pct" },
];

function KpiCard({
  label, value, loading,
}: { label: string; value: number; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader />
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="my-4 flex items-end justify-center">
        <AnimatedPct target={value} />
      </div>
      {/* Threshold legend */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{"< 40%"}</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />40–65%</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{">= 65%"}</span>
      </div>
    </div>
  );
}

export default function PogKpiCards({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {KPIS.map(({ label, key }) => (
        <KpiCard
          key={key}
          label={label}
          value={data?.[key] ?? 0}
          loading={loading && !data}
        />
      ))}
    </div>
  );
}
// Named export alias so OmniRadarView can import { PogKpiCards }
export { PogKpiCards };
