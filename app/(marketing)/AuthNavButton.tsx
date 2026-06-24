"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function AuthNavButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const t = useTranslations("marketing");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedIn(getSession() !== null);
  }, []);

  if (loggedIn) {
    return (
      <Link
        href="/dashboard"
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
