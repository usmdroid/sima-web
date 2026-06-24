"use client";

import { type AdminGlobalSpendBucket, type AdminMonitoringRange } from "@/lib/api";
import { Skeleton } from "@/app/components/Skeleton";

function tickLabel(iso: string, range: AdminMonitoringRange): string {
  const d = new Date(iso);
  if (range === "monthly") {
    return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "short" });
  }
  return d.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
}

export default function SpendTrendChart({
  buckets,
  range,
  loading,
}: {
  buckets: AdminGlobalSpendBucket[];
  range: AdminMonitoringRange;
  loading?: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!buckets || buckets.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        Ma&apos;lumot yo&apos;q
      </div>
    );
  }

  const max = Math.max(...buckets.map((b) => b.spentSim), 1);
  const n = buckets.length;

  const W = Math.max(n * 48, 320);
  const H = 240;
  const padBottom = 36;
  const padTop = 20;
  const chartH = H - padBottom - padTop;
  const slot = W / n;
  const barW = Math.min(slot * 0.6, 40);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-64 w-full min-w-full"
        role="img"
        aria-label="Kredit sarfi diagrammasi"
      >
        <line x1={0} y1={H - padBottom} x2={W} y2={H - padBottom} stroke="#D9C7A4" strokeWidth={1} />
        {buckets.map((b, i) => {
          const h = (b.spentSim / max) * chartH;
          const x = i * slot + (slot - barW) / 2;
          const y = H - padBottom - h;
          return (
            <g key={b.ts}>
              <rect x={x} y={y} width={barW} height={Math.max(h, 1)} rx={3} fill="#B08D57" />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="#6B6356" fontSize={11}>
                {Math.round(b.spentSim)}
              </text>
              <text x={x + barW / 2} y={H - padBottom + 16} textAnchor="middle" fill="#6B6356" fontSize={10}>
                {tickLabel(b.ts, range)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
