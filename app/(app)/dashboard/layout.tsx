"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { KeyRound, BarChart2, Wallet, Code2, Settings, ShieldAlert, X } from "lucide-react";
import { getSession, clearSession, getWallet, type ClientInfo } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import { Spinner } from "@/app/components/Spinner";
import { Skeleton } from "@/app/components/Skeleton";
import { ThemeSwitcher } from "@/app/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

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
    <div className="mx-3 mb-3 rounded-xl border border-line bg-[rgba(176,141,87,0.06)] p-3">
      <div className="flex items-center gap-2">
        <Image src="/sim-icon.png" alt="SIM" width={20} height={20} className="shrink-0" />
        <div className="min-w-0 flex-1">
          {balance != null
            ? <span className="text-sm font-bold text-primary">{Math.round(balance).toLocaleString()} {t("sim")}</span>
            : <Skeleton className="h-4 w-16" />}
        </div>
      </div>
      <Link
        href="/dashboard/wallet"
        className="mt-2 flex w-full items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-hover"
      >
        {t("addCredits")}
      </Link>
    </div>
  );
}

function SidebarContent({
  client,
  token,
  navItems,
  isActive,
  onLogout,
  onClose,
}: {
  client: ClientInfo;
  token: string;
  navItems: { href: string; label: string; exact: boolean; icon: React.ElementType }[];
  isActive: (href: string, exact: boolean) => boolean;
  onLogout: () => void;
  onClose?: () => void;
}) {
  const t = useTranslations("nav");

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="text-lg font-bold text-primary hover:text-accent transition-colors"
        >
          {BRAND}
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label="Yopish" className="text-muted hover:text-primary transition-colors md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Balance widget */}
      <div className="pt-3 shrink-0">
        <BalanceWidget token={token} />
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-beige text-accent"
                  : "text-muted hover:bg-bg hover:text-primary"
              }`}
            >
              {Icon && <Icon size={15} className="shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-line px-3 py-3 space-y-2">
        {/* User profile */}
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
            {(client.name || client.email || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            {client.name && <p className="truncate text-sm font-medium text-primary">{client.name}</p>}
            <p className="truncate text-xs text-muted">{client.email || client.phone}</p>
          </div>
        </div>

        {/* Theme switcher */}
        <div className="px-2">
          <ThemeSwitcher />
        </div>

        {/* Language switcher */}
        <div className="px-2">
          <LanguageSwitcher />
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-bg hover:text-primary transition-colors"
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const t = useTranslations("nav");

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClient(s.client);
    setToken(s.token);
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  if (!client || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard/keys", label: t("keys"), exact: false, icon: KeyRound },
    { href: "/dashboard/monitoring", label: t("monitoring"), exact: false, icon: BarChart2 },
    { href: "/dashboard/wallet", label: t("wallet"), exact: false, icon: Wallet },
    { href: "/dashboard/developers", label: t("developers"), exact: false, icon: Code2 },
    { href: "/dashboard/settings", label: t("settings"), exact: false, icon: Settings },
    ...(client.role === "SUPER_ADMIN"
      ? [{ href: "/admin", label: t("admin"), exact: false, icon: ShieldAlert }]
      : []),
  ];

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-surface border-r border-line">
        <SidebarContent
          client={client}
          token={token}
          navItems={navItems}
          isActive={isActive}
          onLogout={logout}
        />
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-line md:hidden transition-transform duration-200 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          client={client}
          token={token}
          navItems={navItems}
          isActive={isActive}
          onLogout={logout}
          onClose={() => setDrawerOpen(false)}
        />
      </aside>

      {/* Right column: topbar + content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-line bg-surface">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile: hamburger + logo */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setDrawerOpen((v) => !v)}
                aria-label="Menyu"
                className="text-muted hover:text-primary transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="text-lg font-bold text-primary">
                {BRAND}
              </Link>
            </div>
            {/* Desktop spacer */}
            <div className="hidden md:block" />
            <div />
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
