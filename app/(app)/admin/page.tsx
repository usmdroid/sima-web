"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getSession,
  clearSession,
  getAdminStats,
  getAdminClients,
  creditAdminClient,
  suspendAdminClient,
  activateAdminClient,
  type AdminStats,
  type AdminClient,
} from "@/lib/api";
import { BRAND } from "@/lib/brand";
import ClientDetailPanel from "./ClientDetailPanel";

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creditFor, setCreditFor] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Role-gating: only SUPER_ADMIN may stay here.
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.client.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setToken(s.token);
    setReady(true);
  }, [router]);

  const load = useCallback(async (t: string) => {
    setError(null);
    try {
      const [st, cl] = await Promise.all([getAdminStats(t), getAdminClients(t)]);
      setStats(st);
      setClients(cl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  async function submitCredit(id: string) {
    if (!token) return;
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount === 0) {
      setError("To'g'ri miqdor kiriting.");
      return;
    }
    setActionBusy(id);
    setError(null);
    try {
      await creditAdminClient(token, id, amount);
      setCreditFor(null);
      setCreditAmount("");
      await load(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setActionBusy(null);
    }
  }

  async function toggleStatus(c: AdminClient) {
    if (!token) return;
    setActionBusy(c.id);
    setError(null);
    try {
      if (c.status === "ACTIVE") {
        await suspendAdminClient(token, c.id);
      } else {
        await activateAdminClient(token, c.id);
      }
      await load(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setActionBusy(null);
    }
  }

  if (!ready) {
    return <div className="p-10 text-slate-500">Yuklanmoqda…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-slate-900">
            {BRAND} <span className="text-sm font-normal text-slate-400">admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-600 hover:text-indigo-600"
            >
              Dashboard
            </Link>
            <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {/* Platform stats */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Mijozlar
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "…" : stats?.totalClients?.toLocaleString() ?? "0"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Jami so&apos;rovlar
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "…" : stats?.totalRequests?.toLocaleString() ?? "0"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Jami daromad
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "…"
                : Math.round(stats?.totalRevenueSim ?? 0).toLocaleString()}{" "}
              <span className="text-sm font-normal text-slate-500">sim</span>
            </p>
          </div>
        </section>

        {/* Clients table */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Mijozlar</h2>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Yuklanmoqda…</p>
          ) : clients.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Mijozlar yo&apos;q.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3">Ism</th>
                    <th className="py-2 pr-3">Telefon</th>
                    <th className="py-2 pr-3 text-right">Balans</th>
                    <th className="py-2 pr-3 text-right">So&apos;rovlar</th>
                    <th className="py-2 pr-3">Holat</th>
                    <th className="py-2 pr-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((c) => (
                    <tr key={c.id} className="align-top hover:bg-slate-50">
                      <td className="py-3 pr-3 text-slate-900">{c.name}</td>
                      <td className="py-3 pr-3 text-slate-600">{c.phone}</td>
                      <td className="py-3 pr-3 text-right text-slate-900">
                        {Math.round(c.balanceSim).toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-500">sim</span>
                      </td>
                      <td className="py-3 pr-3 text-right text-slate-600">
                        {c.totalRequests.toLocaleString()}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            c.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {c.status === "ACTIVE" ? "Faol" : "Bloklangan"}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              onClick={() => setDetailId(c.id)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300"
                            >
                              Batafsil
                            </button>
                            <button
                              onClick={() =>
                                setCreditFor(creditFor === c.id ? null : c.id)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300"
                            >
                              Balans
                            </button>
                            <button
                              onClick={() => toggleStatus(c)}
                              disabled={actionBusy === c.id}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50 ${
                                c.status === "ACTIVE"
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {c.status === "ACTIVE" ? "Bloklash" : "Faollashtirish"}
                            </button>
                          </div>
                          {creditFor === c.id && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="sim miqdori"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                                className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => submitCredit(c.id)}
                                disabled={actionBusy === c.id}
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {actionBusy === c.id ? "…" : "Qo'shish"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {token && detailId && (
        <ClientDetailPanel
          token={token}
          clientId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
