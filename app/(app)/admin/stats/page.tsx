"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  getAdminStats,
  getAdminGlobalMonitoring,
  type AdminStats,
  type AdminGlobalMonitoring,
} from "@/lib/api";
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";

export default function AdminStatsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [global, setGlobal] = useState<AdminGlobalMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s) setToken(s.token);
  }, []);

  const load = useCallback(async (tk: string) => {
    setLoading(true);
    setError(null);
    try {
      const [st, gl] = await Promise.all([
        getAdminStats(tk),
        getAdminGlobalMonitoring(tk, "monthly"),
      ]);
      setStats(st);
      setGlobal(gl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) load(token);
  }, [token, load]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">Statistika</h1>
      <p className="mt-1 text-sm text-muted">Platform bo&apos;yicha umumiy statistika</p>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Platform overview */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Jami mijozlar</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-primary">
              {stats?.totalClients?.toLocaleString() ?? "0"}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Jami so&apos;rovlar</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-primary">
              {stats?.totalRequests?.toLocaleString() ?? "0"}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Jami daromad</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-primary">
              {Math.round(stats?.totalRevenueSim ?? 0).toLocaleString()}
              <SimIcon size={18} className="inline-block" />
            </p>
          )}
        </div>
      </section>

      {/* Monthly request breakdown */}
      {!loading && global && (
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Kunlik so&apos;rovlar</p>
            <p className="mt-2 text-2xl font-bold text-primary">
              {global.totalRequests.day.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Haftalik so&apos;rovlar</p>
            <p className="mt-2 text-2xl font-bold text-primary">
              {global.totalRequests.week.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Oylik so&apos;rovlar</p>
            <p className="mt-2 text-2xl font-bold text-primary">
              {global.totalRequests.month.toLocaleString()}
            </p>
          </div>
        </section>
      )}

      {/* Error rate */}
      {!loading && global && (
        <section className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Xato darajasi</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {(global.errorRate.rate * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-muted">
            {global.errorRate.failed.toLocaleString()} muvaffaqiyatsiz /{" "}
            {global.errorRate.totalTryons.toLocaleString()} jami so&apos;rov (so&apos;nggi 30 kun)
          </p>
        </section>
      )}

      {/* Top clients */}
      {!loading && global && global.topClients.length > 0 && (
        <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <h3 className="font-semibold text-primary">Top mijozlar (oylik)</h3>
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
                {global.topClients.map((c, i) => (
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
        </section>
      )}

      {/* MAU/DAU placeholder */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <h3 className="font-semibold text-primary">MAU / DAU</h3>
        <p className="mt-2 text-sm text-muted">
          <span className="inline-block rounded-full bg-beige px-2.5 py-0.5 text-xs font-medium" style={{ color: "#B08D57" }}>
            Tez orada
          </span>
        </p>
        <p className="mt-2 text-sm text-muted">
          Faol foydalanuvchilar statistikasi keyingi yangilashda qo&apos;shiladi.
        </p>
      </section>
    </div>
  );
}
