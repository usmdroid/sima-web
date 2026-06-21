"use client";

import { useState, useEffect, useCallback } from "react";
import { getMonitoringHistory, type MonitoringHistoryItem } from "@/lib/api";
import ExpansionPanel from "./ExpansionPanel";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorySection({ token }: { token: string }) {
  const [items, setItems] = useState<MonitoringHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setError(null);
    try {
      const h = await getMonitoringHistory(token, { limit: 50 });
      setItems(h.items);
      setTotal(h.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <ExpansionPanel
      title="Tarix"
      leading={
        !loading && !error ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {total}
          </span>
        ) : null
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Yuklanmoqda…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">Hali tarix yo&apos;q.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3">Vaqt</th>
                <th className="py-2 pr-3">Kalit</th>
                <th className="py-2 pr-3">Natija</th>
                <th className="py-2 pr-3 text-right">Sarf</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50">
                  <td className="py-3 pr-3 text-slate-600">{fmtDateTime(it.createdAt)}</td>
                  <td className="py-3 pr-3 text-slate-900">
                    {it.keyName ? (
                      <span>
                        {it.keyName}
                        {it.keyPrefix ? (
                          <span className="ml-1 text-slate-400">{it.keyPrefix}…</span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-slate-600">{it.result}</td>
                  <td className="py-3 pr-3 text-right text-slate-900">
                    {it.spentSim.toFixed(3)}{" "}
                    <span className="text-xs font-normal text-slate-500">sim</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ExpansionPanel>
  );
}
