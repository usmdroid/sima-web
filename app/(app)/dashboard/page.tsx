"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getSession,
  clearSession,
  getMonitoringSummary,
  type ClientInfo,
  type MonitoringSummary,
} from "@/lib/api";
import { BRAND } from "@/lib/brand";
import ApiKeysSection from "./ApiKeysSection";
import HistorySection from "./HistorySection";
import CreditBadge from "./CreditBadge";

export default function DashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setClient(s.client);
    setToken(s.token);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getMonitoringSummary(token)
      .then((s) => {
        if (active) setSummary(s);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSummaryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  if (!client) {
    return <div className="p-10 text-slate-500">Yuklanmoqda…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-lg font-bold text-slate-900">
            {BRAND} <span className="text-sm font-normal text-slate-400">dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/monitoring"
              className="text-sm text-slate-600 hover:text-indigo-600"
            >
              Monitoring
            </Link>
            {client.role === "SUPER_ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Admin
              </Link>
            )}
            {token && <CreditBadge token={token} />}
            <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Xush kelibsiz, {client.name} 👋</h1>
        <p className="mt-2 text-slate-600">{client.phone}{client.email ? ` · ${client.email}` : ""}</p>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Umumiy sarf
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summaryLoading
                ? "…"
                : Math.round(summary?.totalSpentSim ?? 0).toLocaleString()}{" "}
              <span className="text-sm font-normal text-slate-500">sim</span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Foydalanish soni
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summaryLoading
                ? "…"
                : summary?.totalRequests?.toLocaleString() ?? "0"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Balans
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summaryLoading
                ? "…"
                : Math.round(summary?.balanceSim ?? 0).toLocaleString()}{" "}
              <span className="text-sm font-normal text-slate-500">sim</span>
            </p>
          </div>
        </section>

        <div className="mt-8 space-y-4">
          {token && <ApiKeysSection token={token} />}
          {token && <HistorySection token={token} />}
        </div>
      </main>
    </div>
  );
}
