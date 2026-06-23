import Link from "next/link";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";
import AuthNavButton from "./AuthNavButton";

/** Brend logosi — nomni avtomatik ikkiga bo'lib, ikkinchi qismini aksent qiladi. */
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
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="/#features" className="nav-link hover:text-accent transition-colors">Imkoniyatlar</a>
          <a href="/#how" className="nav-link hover:text-accent transition-colors">Qanday ishlaydi</a>
          <a href="/#partner" className="nav-link hover:text-accent transition-colors">Hamkorlik</a>
          <Link href="/example" className="font-medium text-accent hover:text-hover transition-colors">Namuna</Link>
        </nav>
        <AuthNavButton />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-beige">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row">
        <div className="font-semibold text-primary">
          <BrandLogo />
        </div>
        <div>Virtual kiyib ko&apos;rish xizmati · {new Date().getFullYear()}</div>
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
