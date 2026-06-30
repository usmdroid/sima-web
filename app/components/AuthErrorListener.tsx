"use client";

import { useEffect, useState } from "react";
import { clearSession, type AuthErrorType } from "@/lib/api";
import { ModalShell } from "@/app/components/sidebar-shared";

const SUPPORT_TG = "https://t.me/simasupportbot";

/**
 * Global autentikatsiya xatolari uchun modal.
 * Listener `sima:auth-error` event'iga ulanadi (api.ts'da emitAuthError).
 * - SUSPENDED → bloklangan akkaunt modali, t.me/simasupportbot bilan
 * - EXPIRED   → "Sessiya tugadi, qaytadan kiring" modali
 * Foydalanuvchi "Login" tugmasini bossa, sessiya tozalanib /login'ga yo'naltiriladi.
 */
export default function AuthErrorListener() {
  const [type, setType] = useState<AuthErrorType | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ type: AuthErrorType }>).detail;
      if (!detail) return;
      setType((prev) => prev ?? detail.type); // birinchi event yetadi
    }
    window.addEventListener("sima:auth-error", handler as EventListener);
    return () => window.removeEventListener("sima:auth-error", handler as EventListener);
  }, []);

  if (!type) return null;

  function goToLogin() {
    clearSession();
    window.location.href = "/login";
  }

  if (type === "SUSPENDED") {
    return (
      <ModalShell onBackdropClick={undefined}>
        <IconCircle color="red">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </IconCircle>
        <h2 className="font-serif text-lg font-bold text-primary">Foydalanishda muammo mavjud</h2>
        <p className="mt-2 text-sm text-muted">
          Hisobingiz vaqtincha to&apos;xtatilgan. Yordam uchun iltimos administrator bilan bog&apos;laning.
        </p>
        <a
          href={SUPPORT_TG}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-hover"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.66-.643.135-.953l11.566-4.458c.538-.196 1.006.128.832.953l.001-.015z" />
          </svg>
          @simasupportbot
        </a>
        <button
          onClick={goToLogin}
          className="mt-3 w-full rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition hover:bg-bg hover:text-primary"
        >
          Login sahifasiga
        </button>
      </ModalShell>
    );
  }

  // EXPIRED
  return (
    <ModalShell onBackdropClick={undefined}>
      <IconCircle color="accent">
        <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </IconCircle>
      <h2 className="font-serif text-lg font-bold text-primary">Sessiya muddati tugadi</h2>
      <p className="mt-2 text-sm text-muted">
        Xavfsizlik uchun sizni tizimdan chiqardik. Davom etish uchun iltimos qayta kirishingizni so&apos;raymiz.
      </p>
      <button
        onClick={goToLogin}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-hover"
      >
        Qayta kirish
      </button>
    </ModalShell>
  );
}

function IconCircle({ color, children }: { color: "red" | "accent"; children: React.ReactNode }) {
  const bg = color === "red" ? "bg-red-100" : "bg-accent/15";
  return <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>{children}</div>;
}
