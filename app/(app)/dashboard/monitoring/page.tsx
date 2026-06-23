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

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const RANGES: { id: MonitoringRange; label: string }[] = [
  { id: "hourly", label: "Soatlik" },
  { id: "daily", label: "Kunlik" },
  { id: "weekly", label: "Haftalik" },
  { id: "monthly", label: "Oylik" },
];

export default function MonitoringPage() {
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

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setToken(s.token);
  }, []);

  const loadTop = useCallback(async (t: string) => {
    setTopError(null);
    try {
      const [s, k] = await Promise.all([
        getMonitoringSummary(t),
        getMonitoringByKey(t),
      ]);
      setSummary(s);
      setByKey(k);
    } catch (e) {
      setTopError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setTopLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) loadTop(token);
  }, [token, loadTop]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setChartLoading(true);
    setChartError(null);
    getMonitoringTimeseries(token, range, selectedKeyId)
      .then((res) => {
        if (active) setBuckets(res.buckets);
      })
      .catch((e) => {
        if (active)
          setChartError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
      })
      .finally(() => {
        if (active) setChartLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, range, selectedKeyId]);

  if (!token) {
    return <div className="p-10 text-slate-500">Yuklanmoqda…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Monitoring</h1>

      {topError && <p className="mt-4 text-sm text-red-500">{topError}</p>}

      {/* ============ Umumiy kartalar ============ */}
      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Foydalanish soni
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {topLoading ? "…" : summary?.totalRequests.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Umumiy sarf
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {topLoading ? "…" : Math.round(summary?.totalSpentSim ?? 0).toLocaleString()}{" "}
            <span className="text-sm font-normal text-slate-500">sim</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Balans
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {topLoading ? "…" : Math.round(summary?.balanceSim ?? 0).toLocaleString()}{" "}
            <span className="text-sm font-normal text-slate-500">sim</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Kalitlar soni
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {topLoading ? "…" : summary?.keysCount ?? "—"}
          </p>
        </div>
      </section>

      {/* ============ Kalitlar bo'yicha jadval ============ */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">
          Batafsil — SK kalitlar bo&apos;yicha
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Diagrammani filtrlash uchun qatorni tanlang.
        </p>

        <div className="mt-4">
          {topLoading && (
            <p className="text-sm text-slate-400">Yuklanmoqda…</p>
          )}
          {!topLoading && !topError && byKey.length === 0 && (
            <p className="text-sm text-slate-400">Hali ma&apos;lumot yo&apos;q.</p>
          )}
          {byKey.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3 font-medium">Nomi</th>
                    <th className="py-2 pr-3 font-medium">Prefiks</th>
                    <th className="py-2 pr-3 text-right font-medium">So&apos;rovlar</th>
                    <th className="py-2 pr-3 text-right font-medium">Sarf (sim)</th>
                    <th className="py-2 pr-3 font-medium">So&apos;nggi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr
                    onClick={() => setSelectedKeyId(null)}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      selectedKeyId === null ? "bg-indigo-50" : ""
                    }`}
                  >
                    <td className="py-3 pr-3 font-medium text-slate-900">
                      Barchasi
                    </td>
                    <td className="py-3 pr-3 text-slate-400">—</td>
                    <td className="py-3 pr-3 text-right text-slate-600">
                      {byKey
                        .reduce((s, r) => s + r.requests, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-right text-slate-600">
                      {Math.round(
                        byKey.reduce((s, r) => s + r.spentSim, 0)
                      ).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-slate-400">—</td>
                  </tr>
                  {byKey.map((r, i) => {
                    const id = r.apiKeyId ?? `__null_${i}`;
                    const selectable = r.apiKeyId != null;
                    const isSelected =
                      selectable && selectedKeyId === r.apiKeyId;
                    return (
                      <tr
                        key={id}
                        onClick={() =>
                          selectable && setSelectedKeyId(r.apiKeyId)
                        }
                        className={`transition ${
                          selectable
                            ? "cursor-pointer hover:bg-slate-50"
                            : ""
                        } ${isSelected ? "bg-indigo-50" : ""}`}
                      >
                        <td className="py-3 pr-3">
                          <span className="font-medium text-slate-900">
                            {r.name}
                          </span>
                          {r.revokedAt && (
                            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                              bekor qilingan
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs text-slate-400">
                          {r.keyPrefix ? `${r.keyPrefix}…` : "—"}
                        </td>
                        <td className="py-3 pr-3 text-right text-slate-600">
                          {r.requests.toLocaleString()}
                        </td>
                        <td className="py-3 pr-3 text-right text-slate-600">
                          {Math.round(r.spentSim).toLocaleString()}
                        </td>
                        <td className="py-3 pr-3 text-slate-500">
                          {fmtDate(r.lastUsedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ============ Diagramma ============ */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Diagramma</h3>
            <p className="mt-1 text-xs text-slate-400">
              {selectedKeyId === null
                ? "Barcha kalitlar"
                : byKey.find((r) => r.apiKeyId === selectedKeyId)?.name ??
                  "Tanlangan kalit"}{" "}
              · foydalanish soni
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  range === r.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
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
            <UsageChart
              buckets={buckets}
              range={range}
              loading={chartLoading}
            />
          )}
        </div>
      </section>
    </div>
  );
}
