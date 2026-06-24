"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, saveSession } from "@/lib/api";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorRequired"));
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
