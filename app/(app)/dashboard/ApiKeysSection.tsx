"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  type ApiKey,
  type CreatedApiKey,
} from "@/lib/api";
import ExpansionPanel from "./ExpansionPanel";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ApiKeysSection({ token }: { token: string }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<CreatedApiKey | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setError(null);
    try {
      setKeys(await listApiKeys(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setCreateError("Kalit nomi kiritilishi shart.");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const created = await createApiKey(token, newName.trim());
      setRevealed(created);
      setShowCreate(false);
      setNewName("");
      fetchKeys();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleRevoke(id: string, name: string) {
    if (
      !confirm(
        `"${name}" API kalitini bekor qilmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`
      )
    )
      return;
    setRevoking(id);
    try {
      await revokeApiKey(token, id);
      fetchKeys();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setRevoking(null);
    }
  }

  function copyKey() {
    if (!revealed) return;
    navigator.clipboard.writeText(revealed.key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyRow(id: string, key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    });
  }

  return (
    <ExpansionPanel
      title="API kalitlar"
      defaultOpen
      leading={
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600">
          {keys.length}
        </span>
      }
    >
      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setShowCreate(true);
            setCreateError(null);
            setNewName("");
          }}
          disabled={showCreate}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          + Yangi kalit
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Kalit nomi (masalan, Asosiy sayt)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={createLoading}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createLoading ? "Yaratilmoqda…" : "Yaratish"}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Bekor
          </button>
        </form>
      )}
      {createError && <p className="mt-2 text-sm text-red-500">{createError}</p>}

      {revealed && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            ✅ Kalit yaratildi. Uni xohlagan vaqtda quyidagi ro&apos;yxatdan ham nusxalashingiz mumkin.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded border border-amber-200 bg-white px-3 py-2 font-mono text-sm text-slate-900">
              {revealed.key}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              {copied ? "Nusxalandi!" : "Nusxalash"}
            </button>
          </div>
          <button
            onClick={() => setRevealed(null)}
            className="mt-2 text-sm text-amber-700 hover:underline"
          >
            Yopish
          </button>
        </div>
      )}

      <div className="mt-4">
        {loading && <p className="text-sm text-slate-400">Yuklanmoqda…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && keys.length === 0 && (
          <p className="text-sm text-slate-400">Hali API kalit yo&apos;q.</p>
        )}
        {keys.length > 0 && (
          <div className="divide-y divide-slate-100">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{k.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">
                    {k.keyPrefix}…
                    {k.revokedAt && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                        bekor qilingan
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Yaratilgan: {fmt(k.createdAt)} · So&apos;nggi: {fmt(k.lastUsedAt)}
                  </p>
                </div>
                {!k.revokedAt && (
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    {k.key && (
                      <button
                        onClick={() => copyRow(k.id, k.key!)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        {copiedId === k.id ? "Nusxalandi!" : "Nusxalash"}
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(k.id, k.name)}
                      disabled={revoking === k.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {revoking === k.id ? "…" : "Bekor qilish"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ExpansionPanel>
  );
}
