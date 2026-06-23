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
        <p className="text-muted">Yuklanmoqda…</p>
      </div>
    );
  }

  return (
    <section className="mx-auto flex max-w-lg flex-col px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-primary font-serif">Sima&apos;ga ulanish</h1>

      {uriValid && (
        <div className="mt-3 rounded-2xl border border-line bg-beige px-4 py-3 text-sm text-primary">
          <strong className="font-semibold text-accent">{targetHost}</strong> saytiga ulanmoqchimisiz?
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
              <p className="text-sm text-muted">Hali kalit yo&apos;q. Yangi yarating.</p>
            )}
            {keys.map((k) => {
              const disabled = !k.revealable;
              return (
                <label
                  key={k.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition
                    ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-accent"}
                    ${selectedId === k.id ? "border-accent bg-beige" : "border-line bg-surface"}`}
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
                    <span className="block font-medium text-primary">{k.name}</span>
                    <span className="block text-xs text-muted">{k.keyPrefix}…</span>
                    {disabled && (
                      <span className="block text-xs text-accent">(eski kalit — ulab bo&apos;lmaydi)</span>
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
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-bg"
            />
            <button
              onClick={handleCreateNew}
              disabled={creatingNew || !newKeyName.trim()}
              className="rounded-full bg-beige px-4 py-2 text-sm font-medium text-primary transition hover:bg-line disabled:opacity-50"
            >
              {creatingNew ? "Yaratilmoqda…" : "Yaratish"}
            </button>
          </div>

          {/* Ulanish tugmasi */}
          <button
            onClick={handleConnect}
            disabled={!selectedId || connecting}
            className="mt-6 w-full rounded-full bg-accent px-4 py-3 font-semibold text-white transition hover:bg-hover disabled:opacity-50"
          >
            {connecting ? "Ulanilmoqda…" : "Ulanish"}
          </button>

          <p className="mt-4 text-center text-xs text-muted">
            Kalit faqat {targetHost} serveriga xavfsiz yo&apos;naltiriladi. Brauzerga chiqmaydi.
          </p>
        </>
      )}
    </section>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-muted">Yuklanmoqda…</p></div>}>
      <ConnectContent />
    </Suspense>
  );
}
