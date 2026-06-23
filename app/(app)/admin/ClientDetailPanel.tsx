"use client";

import { useEffect, useState } from "react";
import { getAdminClient, type AdminClientDetail } from "@/lib/api";
import SimIcon from "@/app/components/SimIcon";

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
      className="fixed inset-0 z-50 flex items-start justify-center bg-primary/40 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-primary">Mijoz tafsilotlari</h2>
          <button
            onClick={onClose}
            className="text-sm text-muted hover:text-primary transition-colors"
            aria-label="Yopish"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Yuklanmoqda…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        ) : detail ? (
          <>
            <div className="mt-4">
              <p className="text-xl font-bold text-primary">{detail.name}</p>
              <p className="mt-1 text-sm text-muted">
                {detail.phone}
                {detail.email ? ` · ${detail.email}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted">
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
              <div className="rounded-2xl border border-line bg-bg p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Balans
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xl font-bold text-primary">
                  {Math.round(detail.balanceSim).toLocaleString()}
                  <SimIcon size={16} className="inline-block" />
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-bg p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  So&apos;rovlar
                </p>
                <p className="mt-2 text-xl font-bold text-primary">
                  {detail.totalRequests.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-bg p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Jami sarf
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xl font-bold text-primary">
                  {Math.round(detail.totalSpentSim).toLocaleString()}
                  <SimIcon size={16} className="inline-block" />
                </p>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-sm font-semibold text-primary">
                So&apos;nggi tranzaksiyalar
              </h3>
              {detail.transactions.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Tranzaksiyalar yo&apos;q.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-muted">
                        <th className="py-2 pr-3">Vaqt</th>
                        <th className="py-2 pr-3">Turi</th>
                        <th className="py-2 pr-3 text-right">Miqdor</th>
                        <th className="py-2 pr-3 text-right">Keyingi balans</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {detail.transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-bg transition-colors">
                          <td className="py-3 pr-3 text-muted">
                            {fmtDateTime(t.createdAt)}
                          </td>
                          <td className="py-3 pr-3 text-muted">{t.type}</td>
                          <td
                            className={`py-3 pr-3 text-right ${
                              t.amountSim >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {t.amountSim >= 0 ? "+" : ""}
                            {t.amountSim.toLocaleString()}
                          </td>
                          <td className="py-3 pr-3 text-right text-primary">
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
