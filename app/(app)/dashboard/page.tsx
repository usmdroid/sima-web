"use client";

import { useEffect, useState } from "react";
import {
  getSession,
  getMonitoringSummary,
  type ClientInfo,
  type MonitoringSummary,
} from "@/lib/api";
import ApiKeysSection from "./ApiKeysSection";
import SimIcon from "@/app/components/SimIcon";

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
    return <div className="p-10 text-muted">Yuklanmoqda…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">Xush kelibsiz, {client.name} 👋</h1>
      <p className="mt-2 text-muted">{client.phone}{client.email ? ` · ${client.email}` : ""}</p>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Umumiy sarf
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-primary">
            {summaryLoading
              ? "…"
              : Math.round(summary?.totalSpentSim ?? 0).toLocaleString()}
            <SimIcon size={18} className="inline-block" />
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Foydalanish soni
          </p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {summaryLoading
              ? "…"
              : summary?.totalRequests?.toLocaleString() ?? "0"}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Balans
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-primary">
            {summaryLoading
              ? "…"
              : Math.round(summary?.balanceSim ?? 0).toLocaleString()}
            <SimIcon size={18} className="inline-block" />
          </p>
        </div>
      </section>

      <div className="mt-8">
        {token && <ApiKeysSection token={token} />}
      </div>
    </div>
  );
}
