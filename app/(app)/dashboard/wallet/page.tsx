"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  getWallet,
  getPricing,
  purchaseCredits,
  type WalletInfo,
  type PricingInfo,
} from "@/lib/api";

const PAYMENT_METHODS = [
  { id: "payme", label: "Payme", bg: "#00CCB1", fg: "#0a3d38" },
  { id: "click", label: "Click", bg: "#0098EB", fg: "#ffffff" },
  { id: "uzum", label: "Uzum Bank", bg: "#7E22CE", fg: "#ffffff" },
];

const QUICK = [5, 10, 20, 50];

export default function WalletPage() {
  const [token, setToken] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usd, setUsd] = useState("");
  const [method, setMethod] = useState("payme");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setToken(s.token);
  }, []);

  const load = useCallback(async (t: string) => {
    setError(null);
    try {
      const [w, p] = await Promise.all([getWallet(t), getPricing()]);
      setWallet(w);
      setPricing(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  const rate = pricing?.usdToSim ?? 100;
  const amount = parseFloat(usd);
  const simPreview = !isNaN(amount) && amount > 0 ? Math.round(amount * rate) : null;

  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!usd.trim() || isNaN(amount) || amount <= 0) {
      setPurchaseError("To'g'ri miqdor kiriting.");
      return;
    }
    setPurchasing(true);
    setPurchaseError(null);
    try {
      const updated = await purchaseCredits(token, amount);
      setWallet(updated);
      setUsd("");
    } catch (e) {
      setPurchaseError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setPurchasing(false);
    }
  }

  if (!token) {
    return <div className="p-10 text-slate-500">Yuklanmoqda…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Hamyon</h1>

      {loading && <p className="mt-4 text-sm text-slate-400">Yuklanmoqda…</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* ============ 1-QISM: Credit sotib olish ============ */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div>
          <p className="text-sm text-slate-500">Joriy balans</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-indigo-600">
              {wallet ? Math.round(wallet.balanceSim) : "…"}
            </span>
            <span className="text-slate-500">sim</span>
          </div>
        </div>

        <form onSubmit={handlePurchase} className="mt-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Qancha to&apos;ldiramiz?
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setUsd(String(q))}
                className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                  usd === String(q)
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                ${q}
              </button>
            ))}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                $
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="boshqa"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                className="w-28 rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            1 USD = {rate} sim
            {simPreview != null && (
              <span className="ml-1 font-medium text-slate-600">
                → {simPreview.toLocaleString()} sim olasiz
              </span>
            )}
          </p>

          <p className="mb-2 mt-6 text-sm font-medium text-slate-700">To&apos;lov usuli</p>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                aria-label={m.label}
                className={`flex items-center justify-center rounded-xl border px-3 py-4 transition ${
                  method === m.id
                    ? "border-indigo-500 ring-2 ring-indigo-200"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span
                  className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold tracking-tight"
                  style={{ backgroundColor: m.bg, color: m.fg }}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={purchasing}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {purchasing ? "Amalga oshirilmoqda…" : "Sotib olish"}
          </button>
          {purchaseError && <p className="mt-2 text-sm text-red-500">{purchaseError}</p>}
        </form>
      </section>

      <div className="my-12 border-t border-slate-200" />

      {/* ============ 2-QISM: Narxlar (3 ustun) ============ */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900">Narxlar</h2>
        <p className="mt-1 text-sm text-slate-500">
          Har bir so&apos;rov narxi jami amalga oshirilgan so&apos;rovlar soniga qarab kamayadi.
        </p>

        {pricing && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {pricing.tiers.map((tier, i) => {
              const prev = i > 0 ? pricing.tiers[i - 1].uptoRequests ?? 0 : 0;
              const range =
                tier.uptoRequests === null
                  ? `${prev.toLocaleString()}+ so'rov`
                  : `${prev.toLocaleString()}–${tier.uptoRequests.toLocaleString()} so'rov`;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-center"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {i === 0 ? "Boshlang'ich" : i === 1 ? "O'suvchi" : "Yirik hajm"}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-indigo-600">
                    {tier.simPerRequest}
                  </p>
                  <p className="text-sm text-slate-500">sim / so&apos;rov</p>
                  <p className="mt-3 text-sm text-slate-600">{range}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
