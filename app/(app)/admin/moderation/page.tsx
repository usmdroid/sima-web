"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  getAdminGlobalMonitoring,
  type AdminGlobalMonitoring,
  type AdminGlobalTopClient,
  type AdminMonitoringRange,
} from "@/lib/api";
import ClientDetailPanel from "@/app/(app)/admin/ClientDetailPanel";
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";
import { useTranslations } from "next-intl";

type Filter = "all" | "highError" | "last24h";

function filterClients(
  clients: AdminGlobalTopClient[],
  filter: Filter,
  errorRate: number,
): AdminGlobalTopClient[] {
  if (filter === "highError") {
    // Show clients only when global error rate exceeds 20%; otherwise empty.
    return errorRate > 0.2 ? clients : [];
  }
  if (filter === "last24h") {
    // In daily range all top-clients represent last-24h activity.
    return clients.filter((c) => c.requests > 0);
  }
  return clients;
}

export default function ModerationPage() {
  const t = useTranslations("admin");
  const [token, setToken] = useState<string | null>(null);
  const [range] = useState<AdminMonitoringRange>("daily");
  const [data, setData] = useState<AdminGlobalMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

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

  const errorRate = data?.errorRate.rate ?? 0;
  const filteredClients = data
    ? filterClients(data.topClients, filter, errorRate)
    : [];

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("modAll") },
    { id: "highError", label: t("modHighError") },
    { id: "last24h", label: t("modLast24h") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">{t("modTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("modDesc")}</p>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Global error rate banner */}
      {!loading && data && (
        <div className={`mt-6 flex items-center gap-3 rounded-xl border px-5 py-4 ${
          errorRate > 0.2
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-line bg-surface text-muted"
        }`}>
          <span className="text-lg font-bold">
            {(errorRate * 100).toFixed(1)}%
          </span>
          <span className="text-sm">
            {t("modGlobalError")} — {data.errorRate.failed.toLocaleString()} / {data.errorRate.totalTryons.toLocaleString()}
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              filter === f.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Client list */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <h3 className="font-semibold text-primary mb-4">{t("modRequests")}</h3>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filteredClients.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">{t("modNoData")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">{t("modName")}</th>
                  <th className="py-2 pr-3 text-right">{t("modRequests")}</th>
                  <th className="py-2 pr-3 text-right">{t("modSpent")}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredClients.map((c, i) => (
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
                    <td className="py-3">
                      {token && (
                        <button
                          type="button"
                          onClick={() => setSelectedClientId(c.clientId)}
                          className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-accent hover:bg-beige hover:border-accent transition-colors"
                        >
                          {t("modViewClient")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Client detail panel */}
      {token && selectedClientId && (
        <ClientDetailPanel
          token={token}
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </div>
  );
}
