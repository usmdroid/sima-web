"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function AuthNavButton() {
  const [href, setHref] = useState<string | null>(null);
  const t = useTranslations("marketing");

  useEffect(() => {
    const s = getSession();
    if (!s) { setHref(null); return; }
    const isStaff = s.client.role === "SUPER_ADMIN" || s.client.role === "MODERATOR";
    if (isStaff) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHref(process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? "/admin");
    } else {
      setHref("/dashboard");
    }
  }, []);

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.3)] active:translate-y-0"
      >
        {t("dashboard")}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.3)] active:translate-y-0"
    >
      {t("login")}
    </Link>
  );
}
