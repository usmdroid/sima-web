"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  getAdminGlobalMonitoring,
  getModerationList,
  hideModeration,
  flagModeration,
  restoreModeration,
  type AdminGlobalMonitoring,
  type AdminGlobalTopClient,
  type AdminMonitoringRange,
  type ModerationItem,
  type ModerationFilter,
} from "@/lib/api";
import ClientDetailPanel from "@/app/(app)/admin/ClientDetailPanel";
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";
import { useTranslations } from "next-intl";

// ── Global monitoring filter ─────────────────────────────────────────────────

type GlobalFilter = "all" | "highError" | "last24h";

function filterClients(
  clients: AdminGlobalTopClient[],
  filter: GlobalFilter,
  errorRate: number,
): AdminGlobalTopClient[] {
  if (filter === "highError") {
    return errorRate > 0.2 ? clients : [];
  }
  if (filter === "last24h") {
    return clients.filter((c) => c.requests > 0);
  }
  return clients;
}

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed right-5 top-5 z-[100] max-w-sm rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg">
      {msg}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "HIDDEN"
      ? "text-red-600 bg-red-50 border-red-200"
      : status === "FLAGGED"
        ? "text-yellow-700 bg-yellow-50 border-yellow-200"
        : "text-green-700 bg-green-50 border-green-200";
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ModerationPage() {
  const t = useTranslations("admin");

  // ── Session
  const [token, setToken] = useState<string | null>(null);

  // ── Global monitoring state
  const [range] = useState<AdminMonitoringRange>("daily");
  const [data, setData] = useState<AdminGlobalMonitoring | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<GlobalFilter>("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // ── Moderation list state
  const [modFilter, setModFilter] = useState<ModerationFilter>("all");
  const [modItems, setModItems] = useState<ModerationItem[]>([]);
  const [modTotal, setModTotal] = useState(0);
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const s = getSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s) setToken(s.token);
  }, []);

  // ── Load global monitoring
  const loadGlobal = useCallback(async (tk: string, r: AdminMonitoringRange) => {
    setLoadingGlobal(true);
    setErrorGlobal(null);
    try {
      const d = await getAdminGlobalMonitoring(tk, r);
      setData(d);
    } catch (e) {
      setErrorGlobal(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoadingGlobal(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) loadGlobal(token, range);
  }, [token, range, loadGlobal]);

  // ── Load moderation list
  const loadMod = useCallback(async (tk: string, f: ModerationFilter) => {
    setModLoading(true);
    setModError(null);
    try {
      const result = await getModerationList(tk, f, 50, 0);
      setModItems(result.items);
      setModTotal(result.total);
    } catch (e) {
      setModError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setModLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) loadMod(token, modFilter);
  }, [token, modFilter, loadMod]);

  // ── Moderation actions with optimistic UI
  const doAction = useCallback(
    async (
      id: string,
      action: "hide" | "flag" | "restore",
      successMsg: string,
    ) => {
      if (!token) return;
      const prevStatus = modItems.find((it) => it.id === id)?.moderationStatus;

      // Optimistic update
      const newStatus =
        action === "hide" ? "HIDDEN" : action === "flag" ? "FLAGGED" : "VISIBLE";
      setModItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, moderationStatus: newStatus } : it,
        ),
      );
      setPendingIds((s) => new Set(s).add(id));

      try {
        const fn =
          action === "hide"
            ? hideModeration
            : action === "flag"
              ? flagModeration
              : restoreModeration;
        await fn(token, id);
        setToast(successMsg);
      } catch (e) {
        // Revert on error
        if (prevStatus) {
          setModItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, moderationStatus: prevStatus } : it,
            ),
          );
        }
        setModError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
      } finally {
        setPendingIds((s) => {
          const next = new Set(s);
          next.delete(id);
          return next;
        });
      }
    },
    [token, modItems],
  );

  // ── Derived values
  const errorRate = data?.errorRate.rate ?? 0;
  const filteredClients = data
    ? filterClients(data.topClients, globalFilter, errorRate)
    : [];

  const globalFilters: { id: GlobalFilter; label: string }[] = [
    { id: "all", label: t("modAll") },
    { id: "highError", label: t("modHighError") },
    { id: "last24h", label: t("modLast24h") },
  ];

  const modFilters: { id: ModerationFilter; label: string }[] = [
    { id: "all", label: t("modTxAll") },
    { id: "flagged", label: t("modTxFlagged") },
    { id: "hidden", label: t("modTxHidden") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {toast && (
        <Toast msg={toast} onClose={() => setToast(null)} />
      )}

      <h1 className="text-2xl font-bold text-primary font-serif">{t("modTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("modDesc")}</p>

      {errorGlobal && <p className="mt-4 text-sm text-red-500">{errorGlobal}</p>}

      {/* Global error rate banner */}
      {!loadingGlobal && data && (
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

      {/* Global monitoring filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {globalFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setGlobalFilter(f.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              globalFilter === f.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Global monitoring client list */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <h3 className="font-semibold text-primary mb-4">{t("modRequests")}</h3>
        {loadingGlobal ? (
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

      {/* ── Moderation results section ─────────────────────────────────── */}
      <h2 className="mt-10 text-xl font-bold text-primary font-serif">{t("modResultsTitle")}</h2>

      {modError && <p className="mt-2 text-sm text-red-500">{modError}</p>}

      {/* Moderation filter tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {modFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setModFilter(f.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              modFilter === f.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto flex items-center text-xs text-muted">
          {t("modTxAll")}: {modTotal}
        </span>
      </div>

      {/* Moderation table */}
      <section className="mt-4 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        {modLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : modItems.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">{t("modNoData")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4">{t("modTxClient")}</th>
                  <th className="py-2 pr-4">{t("modTxType")}</th>
                  <th className="py-2 pr-4 text-right">{t("modTxAmount")}</th>
                  <th className="py-2 pr-4">{t("modTxStatus")}</th>
                  <th className="py-2 pr-4">{t("modTxCreatedAt")}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {modItems.map((item) => {
                  const pending = pendingIds.has(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-bg transition-colors">
                      <td className="py-3 pr-4 font-medium text-primary">
                        {item.clientName ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted">{item.type}</td>
                      <td className="py-3 pr-4 text-right text-muted">
                        <span className="inline-flex items-center gap-1">
                          {item.amountSim.toFixed(3)}
                          <SimIcon size={11} className="inline-block" />
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={item.moderationStatus} />
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted whitespace-nowrap">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          {item.moderationStatus !== "HIDDEN" && (
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() =>
                                doAction(item.id, "hide", t("modToastHidden"))
                              }
                              className="rounded border border-line px-2 py-1 text-xs text-muted hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors"
                            >
                              {t("modBtnHide")}
                            </button>
                          )}
                          {item.moderationStatus !== "FLAGGED" && (
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() =>
                                doAction(item.id, "flag", t("modToastFlagged"))
                              }
                              className="rounded border border-line px-2 py-1 text-xs text-muted hover:border-yellow-400 hover:text-yellow-700 disabled:opacity-50 transition-colors"
                            >
                              {t("modBtnFlag")}
                            </button>
                          )}
                          {item.moderationStatus !== "VISIBLE" && (
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() =>
                                doAction(item.id, "restore", t("modToastRestored"))
                              }
                              className="rounded border border-line px-2 py-1 text-xs text-accent hover:border-accent disabled:opacity-50 transition-colors"
                            >
                              {t("modBtnRestore")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
