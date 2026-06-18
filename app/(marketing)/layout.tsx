import Link from "next/link";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";

/** Brend logosi — nomni avtomatik ikkiga bo'lib, ikkinchi qismini aksent qiladi. */
function BrandLogo() {
  const mid = Math.ceil(BRAND.length / 2);
  return (
    <>
      {BRAND.slice(0, mid)}
      <span className="text-indigo-600">{BRAND.slice(mid)}</span>
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="/#features" className="hover:text-slate-900">Imkoniyatlar</a>
          <a href="/#how" className="hover:text-slate-900">Qanday ishlaydi</a>
          <a href="/#partner" className="hover:text-slate-900">Hamkorlik</a>
          <Link href="/example" className="font-medium text-indigo-600 hover:text-indigo-700">Example</Link>
        </nav>
        <Link
          href="/login"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          Kirish
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row">
        <div className="font-semibold text-slate-700">
          <BrandLogo />
        </div>
        <div>Virtual kiyib ko&apos;rish xizmati · {new Date().getFullYear()}</div>
        <a href={`mailto:${BRAND_EMAIL}`} className="hover:text-slate-900">{BRAND_EMAIL}</a>
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
