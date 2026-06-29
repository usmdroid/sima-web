"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, BarChart2, TrendingUp, Settings, LogOut, X } from "lucide-react";
import { getSession, logout, type ClientInfo } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import { Spinner } from "@/app/components/Spinner";
import { LogoutModal, SidebarBottom } from "@/app/components/sidebar-shared";

const ADMIN_NAV = [
  { href: "/admin", label: "Foydalanuvchilar", exact: true, icon: Users },
  { href: "/admin/monitoring", label: "Monitoring", exact: false, icon: BarChart2 },
  { href: "/admin/stats", label: "Statistika", exact: false, icon: TrendingUp },
  { href: "/admin/settings", label: "Sozlamalar", exact: false, icon: Settings },
];


function SidebarContent({
  client,
  drawerClose,
  isActive,
  onLogoutRequest,
}: {
  client: ClientInfo;
  drawerClose?: () => void;
  isActive: (href: string, exact: boolean) => boolean;
  onLogoutRequest: () => void;
}) {
  const roleLabel = client.role === "SUPER_ADMIN" ? "Super Admin" : "Moderator";
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
        <div>
          <Link
            href="/admin"
            onClick={drawerClose}
            className="text-lg font-bold text-primary hover:text-accent transition-colors"
          >
            {BRAND}
          </Link>
          <span className="mt-1 block w-fit rounded-full px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent">
            {roleLabel}
          </span>
        </div>
        {drawerClose && (
          <button
            onClick={drawerClose}
            aria-label="Yopish"
            className="text-muted hover:text-primary transition-colors md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={drawerClose}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-beige text-accent"
                  : "text-muted hover:bg-bg hover:text-primary"
              }`}
            >
              <Icon size={15} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={onLogoutRequest}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 transition hover:bg-bg hover:text-red-700"
        >
          <LogOut size={15} className="shrink-0" />
          Chiqish
        </button>
      </nav>

      <SidebarBottom
        client={client}
        settingsHref="/admin/settings"
        roleLabel={`Sizning rolingiz: ${roleLabel}`}
        onClose={drawerClose}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    if (s.client.role !== "SUPER_ADMIN" && s.client.role !== "MODERATOR") { router.replace("/dashboard"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClient(s.client);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-surface border-r border-line h-screen sticky top-0">
        <SidebarContent
          client={client}
          isActive={isActive}
          onLogoutRequest={() => setShowLogoutModal(true)}
        />
      </aside>

      {/* Mobile overlay */}
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
          drawerClose={() => setDrawerOpen(false)}
          isActive={isActive}
          onLogoutRequest={() => { setDrawerOpen(false); setShowLogoutModal(true); }}
        />
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-line bg-surface md:hidden">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile: hamburger + brand */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setDrawerOpen((v) => !v)}
                aria-label="Menyu"
                className="text-muted hover:text-primary transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Link href="/admin" className="text-lg font-bold text-primary">
                {BRAND}
              </Link>
            </div>
            <div className="hidden md:block" />
            <div />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={logout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
