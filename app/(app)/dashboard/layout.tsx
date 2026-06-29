"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { KeyRound, BarChart2, Wallet, Code2, Settings, X, Users, TrendingUp, LogOut } from "lucide-react";
import { getSession, logout, type ClientInfo } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import { Spinner } from "@/app/components/Spinner";
import { LogoutModal, SidebarBottom } from "@/app/components/sidebar-shared";
import { useTranslations } from "next-intl";


function SidebarContent({
  client,
  token,
  navItems,
  isActive,
  onLogoutRequest,
  onClose,
}: {
  client: ClientInfo;
  token: string;
  navItems: { href: string; label: string; exact: boolean; icon: React.ElementType }[];
  isActive: (href: string, exact: boolean) => boolean;
  onLogoutRequest: () => void;
  onClose?: () => void;
}) {
  const t = useTranslations("nav");
  const isStaff = client.role === "SUPER_ADMIN" || client.role === "MODERATOR";
  const roleLabel = client.role === "SUPER_ADMIN" ? "Super Admin" : "Moderator";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
        <div>
          <Link
            href="/"
            onClick={onClose}
            className="text-lg font-bold text-primary hover:text-accent transition-colors"
          >
            {BRAND}
          </Link>
          {isStaff && (
            <span
              className="mt-1 block w-fit rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: "rgba(176,141,87,0.12)", color: "#B08D57" }}
            >
              {roleLabel}
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Yopish" className="text-muted hover:text-primary transition-colors md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
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
        <button
          onClick={onLogoutRequest}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-bg hover:text-red-700"
        >
          <LogOut size={15} className="shrink-0" />
          {t("logout")}
        </button>
      </nav>

      <SidebarBottom
        client={client}
        token={!isStaff ? token : undefined}
        settingsHref="/dashboard/settings"
        onClose={onClose}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  // Route guard: staff (SUPER_ADMIN/MODERATOR) hitting CLIENT-only routes → redirect /admin
  useEffect(() => {
    if (!client) return;
    if (client.role === "SUPER_ADMIN" || client.role === "MODERATOR") {
      const clientOnly = ["/dashboard/keys", "/dashboard/wallet", "/dashboard/developers"];
      if (clientOnly.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
        router.replace("/admin");
      }
    }
  }, [client, pathname, router]);


  if (!client || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  const isStaff = client.role === "SUPER_ADMIN" || client.role === "MODERATOR";

  const navItems = isStaff
    ? [
        { href: "/admin", label: t("users"), exact: false, icon: Users },
        { href: "/dashboard/monitoring", label: t("monitoring"), exact: false, icon: BarChart2 },
        { href: "/admin/stats", label: t("stats"), exact: false, icon: TrendingUp },
        { href: "/dashboard/settings", label: t("settings"), exact: false, icon: Settings },
      ]
    : [
        { href: "/dashboard/monitoring", label: t("monitoring"), exact: false, icon: BarChart2 },
        { href: "/dashboard/keys", label: t("keys"), exact: false, icon: KeyRound },
        { href: "/dashboard/wallet", label: t("wallet"), exact: false, icon: Wallet },
        { href: "/dashboard/developers", label: t("developers"), exact: false, icon: Code2 },
        { href: "/dashboard/settings", label: t("settings"), exact: false, icon: Settings },
      ];

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-surface border-r border-line h-screen sticky top-0">
        <SidebarContent
          client={client}
          token={token}
          navItems={navItems}
          isActive={isActive}
          onLogoutRequest={() => setShowLogoutModal(true)}
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
          onLogoutRequest={() => { setDrawerOpen(false); setShowLogoutModal(true); }}
          onClose={() => setDrawerOpen(false)}
        />
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only top bar with hamburger */}
        <header className="md:hidden border-b border-line bg-surface">
          <div className="flex items-center gap-3 px-4 py-3">
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
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={logout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
