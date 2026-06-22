"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { connectAuthorize, createApiKey, getSession, listApiKeys, type ApiKey } from "@/lib/api";

// Ichki komponent useSearchParams ishlatadi — Suspense bilan o'ralgan
function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUri = searchParams.get("redirect_uri") ?? "";
  const state = searchParams.get("state") ?? "";

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

  // redirect_uri tekshirish (https yoki localhost)
  const uriValid = (() => {
    if (!redirectUri) return false;
    try {
      const u = new URL(redirectUri);
      if (u.protocol === "https:") return true;
      if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return true;
      return false;
    } catch {
      return false;
    }
  })();

  const targetHost = (() => {
    try { return new URL(redirectUri).hostname; } catch { return redirectUri; }
  })();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      // Login'ga yo'naltiramiz, qaytib kelish uchun hozirgi URL saqlaymiz
      const current = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    if (!uriValid) {
      setLoading(false);
      setError("redirect_uri noto'g'ri yoki yo'q. https bilan boshlanishi kerak (localhost bundan mustasno).");
      return;
    }
    listApiKeys(session.token)
      .then((all) => {
        setKeys(all.filter((k) => k.revokedAt == null));
        setLoading(false);
      })
      .catch(() => {
        setError("Kalitlarni yuklab bo'lmadi.");
        setLoading(false);
      });
  }, [router, uriValid]);

  async function handleCreateNew() {
    const session = getSession();
    if (!session || !newKeyName.trim()) return;
    setCreatingNew(true);
    setError(null);
    try {
      const created = await createApiKey(session.token, newKeyName.trim());
      // Yangi kalitni ro'yxatga qo'shamiz va tanlaymiz
      const newKey: ApiKey = {
        id: created.id,
        name: created.name,
        keyPrefix: created.keyPrefix,
        key: null,
        createdAt: created.createdAt,
        lastUsedAt: null,
        revokedAt: null,
        revealable: true,
      };
      setKeys((prev) => [newKey, ...prev]);
      setSelectedId(created.id);
      setNewKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kalit yaratib bo'lmadi.");
    } finally {
      setCreatingNew(false);
    }
  }

  async function handleConnect() {
    const session = getSession();
    if (!session || !selectedId) return;
    setConnecting(true);
    setError(null);
    try {
      const { code } = await connectAuthorize(session.token, {
        apiKeyId: selectedId,
        redirectUri,
        state: state || null,
      });
      // Brauzerni plugin callback'iga yo'naltiramiz — kalit hech qachon brauzerga chiqmaydi
      const sep = redirectUri.includes("?") ? "&" : "?";
      window.location.href = `${redirectUri}${sep}code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ulanishda xatolik.");
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Yuklanmoqda…</p>
      </div>
    );
  }

  return (
    <section className="mx-auto flex max-w-lg flex-col px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sima'ga ulanish</h1>

      {/* Maqsad domen ko'rsatiladi — open-redirect himoyasi */}
      {uriValid && (
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          <strong className="font-semibold">{targetHost}</strong> saytiga ulanmoqchimisiz?
          <br />
          Quyida kalit tanlang va tasdiqlang.
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!error && uriValid && (
        <>
          {/* Kalit ro'yxati */}
          <div className="mt-6 space-y-2">
            {keys.length === 0 && (
              <p className="text-sm text-slate-500">Hali kalit yo'q. Yangi yarating.</p>
            )}
            {keys.map((k) => {
              const disabled = !k.revealable;
              return (
                <label
                  key={k.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition
                    ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-indigo-400"}
                    ${selectedId === k.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}
                >
                  <input
                    type="radio"
                    name="apiKey"
                    value={k.id}
                    disabled={disabled}
                    checked={selectedId === k.id}
                    onChange={() => setSelectedId(k.id)}
                    className="mt-0.5"
                  />
                  <span className="flex-1">
                    <span className="block font-medium text-slate-800">{k.name}</span>
                    <span className="block text-xs text-slate-400">{k.keyPrefix}…</span>
                    {disabled && (
                      <span className="block text-xs text-amber-600">(eski kalit — ulab bo'lmaydi)</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Yangi kalit yaratish */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Yangi kalit nomi"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={handleCreateNew}
              disabled={creatingNew || !newKeyName.trim()}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
            >
              {creatingNew ? "Yaratilmoqda…" : "Yaratish"}
            </button>
          </div>

          {/* Ulanish tugmasi */}
          <button
            onClick={handleConnect}
            disabled={!selectedId || connecting}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {connecting ? "Ulanilmoqda…" : "Ulanish"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Kalit faqat {targetHost} serveriga xavfsiz yo'naltiriladi. Brauzerga chiqmaydi.
          </p>
        </>
      )}
    </section>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-slate-500">Yuklanmoqda…</p></div>}>
      <ConnectContent />
    </Suspense>
  );
}
