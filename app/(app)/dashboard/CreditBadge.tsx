"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWallet } from "@/lib/api";
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";

// Top barda kreditni ko'rsatuvchi tugma. Bosilganda Hamyon pageni ochadi.
// `balanceSim` berilsa — boshqariladigan (controlled) rejim, aks holda o'zi yuklaydi.
export default function CreditBadge({
  token,
  balanceSim,
}: {
  token: string;
  balanceSim?: number | null;
}) {
  const [fetched, setFetched] = useState<number | null>(null);

  useEffect(() => {
    if (balanceSim != null) return;
    let active = true;
    getWallet(token)
      .then((w) => {
        if (active) setFetched(w.balanceSim);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token, balanceSim]);

  const value = balanceSim != null ? balanceSim : fetched;

  return (
    <Link
      href="/dashboard/wallet"
      className="flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent"
    >
      <SimIcon size={14} className="inline-block" />
      {value != null ? Math.round(value) : <Skeleton className="h-4 w-8" />}
    </Link>
  );
}
