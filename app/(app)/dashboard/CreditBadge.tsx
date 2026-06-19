"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWallet } from "@/lib/api";

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
      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
    >
      <span className="h-2 w-2 rounded-full bg-indigo-500" />
      {value != null ? Math.round(value) : "…"} sim
    </Link>
  );
}
