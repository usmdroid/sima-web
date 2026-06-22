"use client";

import { useEffect, useState } from "react";
import { getAdminClient, type AdminClientDetail } from "@/lib/api";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClientDetailPanel({
  token,
  clientId,
  onClose,
}: {
  token: string;
  clientId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<AdminClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAdminClient(token, clientId)
      .then((d) => {
        if (active) setDetail(d);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, clientId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Mijoz tafsilotlari</h2>
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-900"
            aria-label="Yopish"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Yuklanmoqda…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        ) : detail ? (
          <>
            <div className="mt-4">
              <p className="text-xl font-bold text-slate-900">{detail.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {detail.phone}
                {detail.email ? ` · ${detail.email}` : ""}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {detail.role} ·{" "}
                <span
                  className={
                    detail.status === "ACTIVE" ? "text-green-600" : "text-red-600"
                  }
                >
                  {detail.status === "ACTIVE" ? "Faol" : "Bloklangan"}
                </span>{" "}
                · {fmtDateTime(detail.createdAt)}
              </p>
            </div>

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Balans
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {Math.round(detail.balanceSim).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">sim</span>
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  So&apos;rovlar
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {detail.totalRequests.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Jami sarf
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {Math.round(detail.totalSpentSim).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">sim</span>
                </p>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">
                So&apos;nggi tranzaksiyalar
              </h3>
              {detail.transactions.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Tranzaksiyalar yo&apos;q.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                        <th className="py-2 pr-3">Vaqt</th>
                        <th className="py-2 pr-3">Turi</th>
                        <th className="py-2 pr-3 text-right">Miqdor</th>
                        <th className="py-2 pr-3 text-right">Keyingi balans</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detail.transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-3 pr-3 text-slate-600">
                            {fmtDateTime(t.createdAt)}
                          </td>
                          <td className="py-3 pr-3 text-slate-600">{t.type}</td>
                          <td
                            className={`py-3 pr-3 text-right ${
                              t.amountSim >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {t.amountSim >= 0 ? "+" : ""}
                            {t.amountSim.toLocaleString()}
                          </td>
                          <td className="py-3 pr-3 text-right text-slate-900">
                            {Math.round(t.balanceAfterSim).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
