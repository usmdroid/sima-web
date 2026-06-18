"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession, type ClientInfo } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import ApiKeysSection from "./ApiKeysSection";

export default function DashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setClient(s.client);
    setToken(s.token);
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  if (!client) {
    return <div className="p-10 text-slate-500">Yuklanmoqda…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-lg font-bold text-slate-900">
            {BRAND} <span className="text-sm font-normal text-slate-400">dashboard</span>
          </div>
          <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">
            Chiqish
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Xush kelibsiz, {client.name} 👋</h1>
        <p className="mt-2 text-slate-600">{client.phone}{client.email ? ` · ${client.email}` : ""}</p>

        <div className="mt-8 space-y-4">
          {token && <ApiKeysSection token={token} />}
          <div className="grid gap-4 sm:grid-cols-2">
            {["Foydalanish (counter)", "Tarix (history)"].map((t) => (
              <div key={t} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">{t}</h3>
                <p className="mt-2 text-sm text-slate-400">Tez orada</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
