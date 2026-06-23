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
import SimIcon from "@/app/components/SimIcon";
import { Skeleton } from "@/app/components/Skeleton";
import { Spinner } from "@/app/components/Spinner";

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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">Hamyon</h1>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* ============ 1-QISM: Credit sotib olish ============ */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <div>
          <p className="text-sm text-muted">Joriy balans</p>
          <div className="mt-1 flex items-center gap-2">
            {wallet
              ? <span className="text-4xl font-bold text-accent">{Math.round(wallet.balanceSim)}</span>
              : <Skeleton className="h-10 w-28" />}
            <SimIcon size={24} className="inline-block" />
          </div>
        </div>

        <form onSubmit={handlePurchase} className="mt-6">
          <label className="mb-1.5 block text-sm font-medium text-primary">
            Qancha to&apos;ldiramiz?
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setUsd(String(q))}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                  usd === String(q)
                    ? "border-accent bg-beige text-accent"
                    : "border-line text-muted hover:border-accent"
                }`}
              >
                ${q}
              </button>
            ))}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                $
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="boshqa"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                className="w-28 rounded-full border border-line py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-muted">
            1 USD = {rate}{" "}
            <SimIcon size={12} className="inline-block align-middle" />
            {simPreview != null && (
              <span className="ml-1 font-medium text-primary">
                → {simPreview.toLocaleString()} olasiz
              </span>
            )}
          </p>

          <p className="mb-2 mt-6 text-sm font-medium text-primary">To&apos;lov usuli</p>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                aria-label={m.label}
                className={`flex items-center justify-center rounded-2xl border px-3 py-4 transition ${
                  method === m.id
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-line hover:border-accent"
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
            className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:translate-y-0 sm:w-auto sm:px-8"
          >
            {purchasing && <Spinner size={14} className="text-white" />}
            {purchasing ? "Amalga oshirilmoqda…" : "Sotib olish"}
          </button>
          {purchaseError && <p className="mt-2 text-sm text-red-500">{purchaseError}</p>}
        </form>
      </section>

      <div className="my-12 border-t border-line" />

      {/* ============ 2-QISM: Narxlar (3 ustun) ============ */}
      <section>
        <h2 className="text-lg font-semibold text-primary">Narxlar</h2>
        <p className="mt-1 text-sm text-muted">
          Har bir so&apos;rov narxi jami amalga oshirilgan so&apos;rovlar soniga qarab kamayadi.
        </p>

        {loading && !pricing && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
          </div>
        )}
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
                  className="rounded-2xl border border-line bg-surface p-6 text-center shadow-[0_1px_2px_rgba(29,29,29,0.04)]"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {i === 0 ? "Boshlang'ich" : i === 1 ? "O'suvchi" : "Yirik hajm"}
                  </p>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-3xl font-bold text-accent">
                    {tier.simPerRequest}
                    <SimIcon size={20} className="inline-block" />
                  </p>
                  <p className="text-sm text-muted">so&apos;rov boshiga</p>
                  <p className="mt-3 text-sm text-muted">{range}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
