"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  getMonitoringSummary,
  getMonitoringByKey,
  getMonitoringTimeseries,
  getAdminGlobalMonitoring,
  type MonitoringSummary,
  type MonitoringByKey,
  type MonitoringBucket,
  type MonitoringRange,
  type AdminGlobalMonitoring,
  type AdminMonitoringRange,
} from "@/lib/api";
import UsageChart from "./UsageChart";
import SpendTrendChart from "./SpendTrendChart";
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

// ---- Demo data (real ma'lumot bo'lmaganda ko'rsatiladi) ----

const DEMO_COUNTS: Record<MonitoringRange, number[]> = {
  hourly:  [2, 1, 0, 1, 3, 8, 15, 22, 28, 31, 29, 24, 26, 30, 27, 22, 18, 14, 10, 8, 6, 4, 3, 2],
  daily:   [15, 23, 18, 32, 45, 38, 12, 27, 41, 55, 48, 36, 62, 71],
  weekly:  [48, 65, 72, 58, 89, 104, 95, 118],
  monthly: [120, 185, 240, 195, 310, 428],
};

function generateDemoBuckets(range: MonitoringRange): MonitoringBucket[] {
  const now = new Date();
  return DEMO_COUNTS[range].map((count, i) => {
    const d = new Date(now);
    const offset = DEMO_COUNTS[range].length - 1 - i;
    if (range === "hourly")       { d.setHours(d.getHours() - offset, 0, 0, 0); }
    else if (range === "daily")   { d.setDate(d.getDate() - offset); d.setHours(0, 0, 0, 0); }
    else if (range === "weekly")  { d.setDate(d.getDate() - offset * 7); d.setHours(0, 0, 0, 0); }
    else                          { d.setMonth(d.getMonth() - offset); d.setDate(1); d.setHours(0, 0, 0, 0); }
    return { ts: d.toISOString(), count, spentSim: count };
  });
}

// ---- Helpers ----

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---- SUPER_ADMIN global monitoring view ----

function GlobalMonitoringView({ token }: { token: string }) {
  const [range, setRange] = useState<AdminMonitoringRange>("daily");
  const [data, setData] = useState<AdminGlobalMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const RANGES: { id: AdminMonitoringRange; label: string }[] = [
    { id: "daily", label: "Kunlik" },
    { id: "weekly", label: "Haftalik" },
    { id: "monthly", label: "Oylik" },
  ];

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
    load(token, range);
  }, [token, range, load]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">Global Monitoring</h1>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Total requests: day / week / month */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">So&apos;rovlar (kun)</p>
          {loading
            ? <Skeleton className="mt-2 h-8 w-20" />
            : <p className="mt-2 text-2xl font-bold text-primary">{data?.totalRequests.day.toLocaleString() ?? "—"}</p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">So&apos;rovlar (hafta)</p>
          {loading
            ? <Skeleton className="mt-2 h-8 w-20" />
            : <p className="mt-2 text-2xl font-bold text-primary">{data?.totalRequests.week.toLocaleString() ?? "—"}</p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">So&apos;rovlar (oy)</p>
          {loading
            ? <Skeleton className="mt-2 h-8 w-20" />
            : <p className="mt-2 text-2xl font-bold text-primary">{data?.totalRequests.month.toLocaleString() ?? "—"}</p>}
        </div>
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

      {/* Top 10 clients */}
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

      {/* Credit spend trend */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-primary">Kredit sarfi trendi</h3>
            <p className="mt-1 text-xs text-muted">Barcha mijozlar bo&apos;yicha jami SIM sarfi</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  range === r.id
                    ? "border-accent bg-beige text-accent"
                    : "border-line text-muted hover:border-accent"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <SpendTrendChart
            buckets={data?.creditSpendTrend.buckets ?? []}
            range={range}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
}

// ---- CLIENT monitoring view (unchanged) ----

export default function MonitoringPage() {
  const t = useTranslations("monitoring");
  const tCommon = useTranslations("common");
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [byKey, setByKey] = useState<MonitoringByKey[]>([]);
  const [topLoading, setTopLoading] = useState(true);
  const [topError, setTopError] = useState<string | null>(null);

  const [range, setRange] = useState<MonitoringRange>("daily");
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<MonitoringBucket[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const RANGES: { id: MonitoringRange; label: string }[] = [
    { id: "hourly", label: t("hourly") },
    { id: "daily", label: t("daily") },
    { id: "weekly", label: t("weekly") },
    { id: "monthly", label: t("monthly") },
  ];

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(s.token);
    setRole(s.client.role ?? "CLIENT");
  }, []);

  const loadTop = useCallback(async (tk: string) => {
    setTopError(null);
    try {
      const [s, k] = await Promise.all([
        getMonitoringSummary(tk),
        getMonitoringByKey(tk),
      ]);
      setSummary(s);
      setByKey(k);
    } catch (e) {
      setTopError(e instanceof Error ? e.message : tCommon("error"));
    } finally {
      setTopLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    // CLIENT path only
    if (token && role && role !== "SUPER_ADMIN") loadTop(token);
    else if (role === "SUPER_ADMIN") setTopLoading(false);
  }, [token, role, loadTop]);

  useEffect(() => {
    if (!token || role === "SUPER_ADMIN") return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChartLoading(true);
    setChartError(null);
    getMonitoringTimeseries(token, range, selectedKeyId)
      .then((res) => {
        if (active) setBuckets(res.buckets);
      })
      .catch((e) => {
        if (active)
          setChartError(e instanceof Error ? e.message : tCommon("error"));
      })
      .finally(() => {
        if (active) setChartLoading(false);
      });
    return () => { active = false; };
  }, [token, range, selectedKeyId, tCommon, role]);

  if (!token || role === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  // SUPER_ADMIN sees the global view
  if (role === "SUPER_ADMIN") {
    return <GlobalMonitoringView token={token} />;
  }

  // CLIENT view (unchanged)
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">{t("title")}</h1>

      {topError && <p className="mt-4 text-sm text-red-500">{topError}</p>}

      {/* Summary cards */}
      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{t("totalRequests")}</p>
          {topLoading
            ? <Skeleton className="mt-2 h-8 w-20" />
            : <p className="mt-2 text-2xl font-bold text-primary">{summary?.totalRequests.toLocaleString() ?? "—"}</p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{t("totalSpent")}</p>
          {topLoading
            ? <Skeleton className="mt-2 h-8 w-20" />
            : <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-accent">
                {Math.round(summary?.totalSpentSim ?? 0).toLocaleString()}
                <SimIcon size={18} className="inline-block" />
              </p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{t("balance")}</p>
          {topLoading
            ? <Skeleton className="mt-2 h-8 w-20" />
            : <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-primary">
                {Math.round(summary?.balanceSim ?? 0).toLocaleString()}
                <SimIcon size={18} className="inline-block" />
              </p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{t("keysCount")}</p>
          {topLoading
            ? <Skeleton className="mt-2 h-8 w-16" />
            : <p className="mt-2 text-2xl font-bold text-primary">{summary?.keysCount ?? "—"}</p>}
        </div>
      </section>

      {/* Detail by key */}
      <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <h3 className="font-semibold text-primary">{t("detailSection")}</h3>
        <p className="mt-1 text-xs text-muted">{t("filterHint")}</p>

        <div className="mt-4">
          {topLoading && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 w-full" />)}
            </div>
          )}
          {!topLoading && !topError && byKey.length === 0 && (
            <p className="text-sm text-muted">{t("noData")}</p>
          )}
          {byKey.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-medium">{t("name")}</th>
                    <th className="py-2 pr-3 font-medium">{t("prefix")}</th>
                    <th className="py-2 pr-3 text-right font-medium">{t("requests")}</th>
                    <th className="py-2 pr-3 text-right font-medium">{t("spent")}</th>
                    <th className="py-2 pr-3 font-medium">{t("lastUsed")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr
                    onClick={() => setSelectedKeyId(null)}
                    className={`cursor-pointer transition hover:bg-bg ${selectedKeyId === null ? "bg-beige" : ""}`}
                  >
                    <td className="py-3 pr-3 font-medium text-primary">{t("all")}</td>
                    <td className="py-3 pr-3 text-muted">—</td>
                    <td className="py-3 pr-3 text-right text-muted">
                      {byKey.reduce((s, r) => s + r.requests, 0).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-right text-muted">
                      {Math.round(byKey.reduce((s, r) => s + r.spentSim, 0)).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-muted">—</td>
                  </tr>
                  {byKey.map((r, i) => {
                    const id = r.apiKeyId ?? `__null_${i}`;
                    const selectable = r.apiKeyId != null;
                    const isSelected = selectable && selectedKeyId === r.apiKeyId;
                    return (
                      <tr
                        key={id}
                        onClick={() => selectable && setSelectedKeyId(r.apiKeyId)}
                        className={`transition ${selectable ? "cursor-pointer hover:bg-bg" : ""} ${isSelected ? "bg-beige" : ""}`}
                      >
                        <td className="py-3 pr-3">
                          <span className="font-medium text-primary">{r.name}</span>
                          {r.revokedAt && (
                            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                              {t("revoked")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs text-muted">
                          {r.keyPrefix ? `${r.keyPrefix}…` : "—"}
                        </td>
                        <td className="py-3 pr-3 text-right text-muted">{r.requests.toLocaleString()}</td>
                        <td className="py-3 pr-3 text-right text-muted">{Math.round(r.spentSim).toLocaleString()}</td>
                        <td className="py-3 pr-3 text-muted">{fmtDate(r.lastUsedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Chart */}
      {(() => {
        const hasReal = !chartLoading && !chartError && buckets.length > 0 && buckets.some(b => b.count > 0);
        const isDemo = !chartLoading && !chartError && !hasReal;
        const displayBuckets = isDemo ? generateDemoBuckets(range) : buckets;
        return (
          <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-primary">{t("chart")}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {selectedKeyId === null
                      ? t("allKeys")
                      : byKey.find((r) => r.apiKeyId === selectedKeyId)?.name ?? t("selectedKey")}{" "}
                    · {t("usageCount")}
                  </p>
                </div>
                {isDemo && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-muted">
                    Demo
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRange(r.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      range === r.id
                        ? "border-accent bg-beige text-accent"
                        : "border-line text-muted hover:border-accent"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              {chartError ? (
                <p className="text-sm text-red-500">{chartError}</p>
              ) : (
                <UsageChart buckets={displayBuckets} range={range} loading={chartLoading} />
              )}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
