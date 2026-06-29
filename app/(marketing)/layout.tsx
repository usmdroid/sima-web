"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";
import AuthNavButton from "./AuthNavButton";
import { ThemeSwitcher } from "@/app/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

function BrandLogo() {
  const mid = Math.ceil(BRAND.length / 2);
  return (
    <>
      {BRAND.slice(0, mid)}
      <span className="text-accent">{BRAND.slice(mid)}</span>
    </>
  );
}

function Header() {
  const t = useTranslations("marketing");
  const [isAdminHost, setIsAdminHost] = useState(false);

  useEffect(() => {
    // Admin subdomain'da marketing nav-anchorlar sahifa yo'q joyga olib boradi,
    // shuning uchun ularni yashiramiz. Marketing site'da esa ular scroll qiladi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdminHost(window.location.hostname.startsWith("admin."));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          <BrandLogo />
        </Link>
        {!isAdminHost && (
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <Link href="/#features" className="nav-link hover:text-accent transition-colors">{t("features")}</Link>
            <Link href="/#how" className="nav-link hover:text-accent transition-colors">{t("how")}</Link>
            <Link href="/#pricing" className="nav-link hover:text-accent transition-colors">{t("pricing")}</Link>
            <Link href="/#partner" className="nav-link hover:text-accent transition-colors">{t("partner")}</Link>
            <Link href="/example" className="font-medium text-accent hover:text-hover transition-colors">{t("example")}</Link>
          </nav>
        )}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <AuthNavButton />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const t = useTranslations("marketing");
  return (
    <footer className="border-t border-line bg-beige">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row">
        <div className="font-semibold text-primary">
          <BrandLogo />
        </div>
        <div>{BRAND} · {new Date().getFullYear()}</div>
        <a href={`mailto:${BRAND_EMAIL}`} className="hover:text-primary transition-colors">{BRAND_EMAIL}</a>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
