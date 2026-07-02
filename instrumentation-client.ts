import * as Sentry from "@sentry/nextjs";
import { getSession } from "./lib/api";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session Replay ataylab o'chiq (maxfiylik) — integratsiyaning o'zi ham qo'shilmagan.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
});

// Sessiya mavjud bo'lsa faqat clientId (UUID) biriktiriladi — ism/email/telefon yuborilmaydi.
const session = getSession();
if (session?.client?.id) {
  Sentry.setUser({ id: session.client.id });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
