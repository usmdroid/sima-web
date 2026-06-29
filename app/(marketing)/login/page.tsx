"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, saveSession, ApiError } from "@/lib/api";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

const SUPPORT_TG = "https://t.me/simasupportbot";

function SuspendedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-line bg-surface px-6 py-6 shadow-xl"
        style={{ animation: "modalIn 200ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-serif text-lg font-bold text-primary">Foydalanishda muammo mavjud</h2>
        <p className="mt-2 text-sm text-muted">
          Hisobingiz vaqtincha to'xtatilgan. Yordam uchun iltimos administrator bilan bog'laning.
        </p>
        <a
          href={SUPPORT_TG}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-hover"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.66-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.953l.001-.015z"/>
          </svg>
          @simasupportbot
        </a>
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition hover:bg-bg hover:text-primary"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const t = useTranslations("login");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError(t("errorRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await login(identifier, password);
      saveSession(res);
      const redirect = searchParams.get("redirect");
      if (redirect && redirect.startsWith("/")) {
        window.location.href = redirect;
        return;
      }
      const isStaff = res.client.role === "SUPER_ADMIN" || res.client.role === "MODERATOR";
      const adminOrigin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN;
      if (isStaff && adminOrigin) {
        window.location.href = adminOrigin;
      } else if (isStaff) {
        // Lokal/preview: alohida origin yo'q — admin yo'liga full reload.
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "SUSPENDED") {
        setSuspended(true);
      } else {
        setError(err instanceof Error ? err.message : t("errorRequired"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="text-2xl font-bold tracking-tight text-primary font-serif">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">{t("identifier")}</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t("identifierPlaceholder")}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-bg"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">{t("password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-bg"
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
        >
          {loading && <Spinner size={14} className="text-white" />}
          {loading ? t("loading") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-accent hover:text-hover transition-colors">{t("register")}</Link>
      </p>

      {suspended && <SuspendedModal onClose={() => setSuspended(false)} />}
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
