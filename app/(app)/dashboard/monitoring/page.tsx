"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  getMonitoringSummary,
  getMonitoringByKey,
  getMonitoringTimeseries,
  type MonitoringSummary,
  type MonitoringByKey,
  type MonitoringBucket,
  type MonitoringRange,
} from "@/lib/api";
import UsageChart from "./UsageChart";
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MonitoringPage() {
  const t = useTranslations("monitoring");
  const tCommon = useTranslations("common");
  const [token, setToken] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) loadTop(token);
  }, [token, loadTop]);

  useEffect(() => {
    if (!token) return;
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
  }, [token, range, selectedKeyId, tCommon]);

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

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
      <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-primary">{t("chart")}</h3>
            <p className="mt-1 text-xs text-muted">
              {selectedKeyId === null
                ? t("allKeys")
                : byKey.find((r) => r.apiKeyId === selectedKeyId)?.name ?? t("selectedKey")}{" "}
              · {t("usageCount")}
            </p>
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
            <UsageChart buckets={buckets} range={range} loading={chartLoading} />
          )}
        </div>
      </section>
    </div>
  );
}
