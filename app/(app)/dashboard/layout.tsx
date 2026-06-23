"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession, type ClientInfo } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import CreditBadge from "./CreditBadge";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Asosiy", exact: true },
  { href: "/dashboard/monitoring", label: "Monitoring", exact: false },
  { href: "/dashboard/wallet", label: "Hamyon", exact: false },
  { href: "/dashboard/developers", label: "Devlar", exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  if (!client || !token) {
    return <div className="p-10 text-slate-500">Yuklanmoqda…</div>;
  }

  const navItems = [
    ...NAV_ITEMS,
    ...(client.role === "SUPER_ADMIN"
      ? [{ href: "/admin", label: "Admin", exact: false }]
      : []),
  ];

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-white border-r border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <Link href="/" className="text-lg font-bold text-slate-900 hover:text-indigo-600">
            {BRAND}
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Right column: topbar + content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile: hamburger + logo */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menyu"
                className="text-slate-600 hover:text-slate-900"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="text-lg font-bold text-slate-900">
                {BRAND}
              </Link>
            </div>
            {/* Desktop: spacer so right-side items stay right */}
            <div className="hidden md:block" />

            <div className="flex items-center gap-4">
              <CreditBadge token={token} />
              <button
                onClick={logout}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Chiqish
              </button>
            </div>
          </div>

          {/* Mobile nav dropdown */}
          {menuOpen && (
            <nav className="md:hidden border-t border-slate-100 px-4 py-2 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href, item.exact)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
