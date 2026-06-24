"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  getAdminGlobalMonitoring,
  type AdminGlobalMonitoring,
  type AdminMonitoringRange,
} from "@/lib/api";
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";

const RANGES: { id: AdminMonitoringRange; label: string }[] = [
  { id: "daily", label: "Kunlik" },
  { id: "weekly", label: "Haftalik" },
  { id: "monthly", label: "Oylik" },
];

export default function AdminMonitoringPage() {
  const [token, setToken] = useState<string | null>(null);
  const [range, setRange] = useState<AdminMonitoringRange>("daily");
  const [data, setData] = useState<AdminGlobalMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s) setToken(s.token);
  }, []);

  const load = useCallback(async (tk: string, r: AdminMonitoringRange) => {
    setLoading(true);
    setError(null);
    try {
      const d = await getAdminGlobalMonitoring(tk, r);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) load(token, range);
  }, [token, range, load]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">Monitoring</h1>
      <p className="mt-1 text-sm text-muted">Platformadagi barcha so&apos;rovlar bo&apos;yicha umumiy ko&apos;rinish</p>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Range selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              range === r.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Requests: day / week / month */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "So'rovlar (kun)", val: data?.totalRequests.day },
          { label: "So'rovlar (hafta)", val: data?.totalRequests.week },
          { label: "So'rovlar (oy)", val: data?.totalRequests.month },
        ].map(({ label, val }) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-primary">{val?.toLocaleString() ?? "—"}</p>
            )}
          </div>
        ))}
      </section>

      {/* Error rate */}
      {!loading && data && (
        <section className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Xato darajasi (oxirgi 30 kun)</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {(data.errorRate.rate * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-muted">
            {data.errorRate.failed.toLocaleString()} / {data.errorRate.totalTryons.toLocaleString()} so&apos;rov
          </p>
        </section>
      )}

      {/* Top clients */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <h3 className="font-semibold text-primary">Top 10 mijozlar</h3>
        {loading ? (
          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !data || data.topClients.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Ma&apos;lumot yo&apos;q.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Ism</th>
                  <th className="py-2 pr-3 text-right">So&apos;rovlar</th>
                  <th className="py-2 pr-3 text-right">Sarf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.topClients.map((c, i) => (
                  <tr key={c.clientId} className="hover:bg-bg transition-colors">
                    <td className="py-3 pr-3 text-muted">{i + 1}</td>
                    <td className="py-3 pr-3 font-medium text-primary">{c.name}</td>
                    <td className="py-3 pr-3 text-right text-muted">{c.requests.toLocaleString()}</td>
                    <td className="py-3 pr-3 text-right">
                      <span className="inline-flex items-center gap-1 text-muted">
                        {Math.round(c.spentSim).toLocaleString()}
                        <SimIcon size={12} className="inline-block" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Credit spend trend (buckets table) */}
      {!loading && data && data.creditSpendTrend.buckets.length > 0 && (
        <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <h3 className="font-semibold text-primary">Kredit sarfi trendi</h3>
          <p className="mt-1 text-xs text-muted">Barcha mijozlar bo&apos;yicha jami SIM sarfi</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">Sana</th>
                  <th className="py-2 pr-3 text-right">Sarf (SIM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.creditSpendTrend.buckets.map((b) => (
                  <tr key={b.ts} className="hover:bg-bg transition-colors">
                    <td className="py-3 pr-3 text-muted">
                      {new Date(b.ts).toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <span className="inline-flex items-center gap-1 text-primary font-medium">
                        {Math.round(b.spentSim).toLocaleString()}
                        <SimIcon size={12} className="inline-block" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
