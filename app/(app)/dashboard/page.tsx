"use client";

import { useEffect, useState } from "react";
import {
  getSession,
  getMonitoringSummary,
  type ClientInfo,
  type MonitoringSummary,
} from "@/lib/api";
import ApiKeysSection from "./ApiKeysSection";

export default function DashboardPage() {
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setClient(s.client);
    setToken(s.token);
  }, []);

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

  if (!client) {
    return <div className="p-10 text-slate-500">Yuklanmoqda…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
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

      <div className="mt-8">
        {token && <ApiKeysSection token={token} />}
      </div>
    </div>
  );
}
