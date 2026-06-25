"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { type ClientInfo, getWallet } from "@/lib/api";
import { formatCredit } from "@/lib/format";
import { Skeleton } from "@/app/components/Skeleton";
import { ThemeSwitcher } from "@/app/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

// ─── Logout confirmation modal ───────────────────────────────────────────────

export function LogoutModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-line bg-surface px-6 py-6 shadow-xl"
        style={{ animation: "modalIn 200ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <h2 className="font-serif text-lg font-bold text-primary">Chiqishni tasdiqlang</h2>
        <p className="mt-2 text-sm text-muted">Hisobingizdan chiqishga ishonchingiz komilmi?</p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition hover:bg-bg hover:text-primary"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Chiqish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Balance widget (CLIENT only) ────────────────────────────────────────────

function BalanceWidget({ token }: { token: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const t = useTranslations("balance");

  useEffect(() => {
    let active = true;
    getWallet(token)
      .then((w) => { if (active) setBalance(w.balanceSim); })
      .catch(() => {});
    return () => { active = false; };
  }, [token]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-[rgba(176,141,87,0.06)] px-3 py-2">
      <Image src="/sim-icon.png" alt="SIM" width={20} height={20} className="shrink-0" />
      <div className="min-w-0 flex-1">
        {balance != null
          ? <span className="font-serif text-sm font-bold text-accent">{formatCredit(Math.round(balance))}</span>
          : <Skeleton className="h-4 w-16" />}
      </div>
      <Link
        href="/dashboard/wallet"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-hover"
        title={t("addCredits")}
        aria-label={t("addCredits")}
      >
        <Plus size={14} />
      </Link>
    </div>
  );
}

// ─── Shared sidebar bottom section ───────────────────────────────────────────
// Includes: balance (optional), theme, language, profile.

export function SidebarBottom({
  client,
  token,
  settingsHref,
  roleLabel,
  onClose,
}: {
  client: ClientInfo;
  token?: string;           // provided → show BalanceWidget
  settingsHref?: string;    // provided → profile is a Link; otherwise plain div
  roleLabel?: string;       // e.g. "Sizning rolingiz: Super Admin"
  onClose?: () => void;
}) {
  const avatar = (client.name || client.email || "?")[0].toUpperCase();

  const profileContent = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
        {avatar}
      </div>
      <div className="min-w-0 flex-1">
        {client.name && <p className="truncate text-xs font-medium text-primary">{client.name}</p>}
        <p className="truncate text-xs text-muted">{client.email || client.phone}</p>
        {roleLabel && <p className="truncate text-xs text-accent">{roleLabel}</p>}
      </div>
    </>
  );

  return (
    <div
      className="shrink-0 px-3 py-3 space-y-2"
      style={{
        backgroundColor: "var(--color-sidebar-footer)",
        borderTop: "1px solid var(--color-sidebar-footer-border)",
      }}
    >
      {token && (
        <div className="px-2">
          <BalanceWidget token={token} />
        </div>
      )}
      <div className="px-2">
        <ThemeSwitcher />
      </div>
      <div className="px-2">
        <LanguageSwitcher />
      </div>
      {settingsHref ? (
        <Link
          href={settingsHref}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-bg"
        >
          {profileContent}
        </Link>
      ) : (
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          {profileContent}
        </div>
      )}
    </div>
  );
}
