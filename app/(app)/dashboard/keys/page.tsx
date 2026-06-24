"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/api";
import ApiKeysSection from "../ApiKeysSection";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

export default function KeysPage() {
  const t = useTranslations("keys");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(s.token);
  }, []);

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-primary font-serif">{t("title")}</h1>
      <div className="mt-8">
        <ApiKeysSection token={token} />
      </div>
    </div>
  );
}
