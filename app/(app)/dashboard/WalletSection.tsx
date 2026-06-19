"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWallet,
  purchaseCredits,
  type WalletInfo,
} from "@/lib/api";

export default function WalletSection({ token }: { token: string }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usd, setUsd] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setError(null);
    try {
      setWallet(await getWallet(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(usd);
    if (!usd.trim() || isNaN(amount) || amount <= 0) {
      setPurchaseError("To'g'ri USD miqdorini kiriting.");
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

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-900">Hamyon</h3>

      {loading && <p className="mt-3 text-sm text-slate-400">Yuklanmoqda…</p>}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {wallet && (
        <>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-600">{fmt(wallet.balanceSim)}</span>
            <span className="text-slate-500">sim</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Jami so&apos;rovlar: {wallet.totalRequests.toLocaleString()}
          </p>

          <form onSubmit={handlePurchase} className="mt-5 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sim sotib olish (USD)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="masalan, 5"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={purchasing}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {purchasing ? "…" : "Sotib olish"}
            </button>
          </form>
          {purchaseError && <p className="mt-2 text-sm text-red-500">{purchaseError}</p>}
          <p className="mt-2 text-xs text-slate-400">1 USD = 100 sim</p>
        </>
      )}
    </div>
  );
}
