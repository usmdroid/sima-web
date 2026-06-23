import Link from "next/link";
import { BRAND } from "@/lib/brand";
import Image from "next/image";

const FEATURES = [
  {
    title: "Oson integratsiya",
    text: "Saytingizga bitta qator skript qo'shasiz — kiyib ko'rish tugmasi tayyor. WordPress va Shopify uchun ham.",
  },
  {
    title: "AI yaroqlilik tekshiruvi",
    text: "Rasm avtomatik tekshiriladi: odam bormi, pozа yaroqlimi, tana ko'rinadimi — sifatsiz natijalarning oldi olinadi.",
  },
  {
    title: "Xavfsiz",
    text: "Bir martali, qisqa muddatli token. Maxfiy kalit hech qachon brauzerga chiqmaydi.",
  },
  {
    title: "Har qanday platforma",
    text: "Custom sayt, WordPress, Shopify — hammasida ishlaydi. Kod yozish shart emas.",
  },
];

const STEPS = [
  { n: "1", title: "Ro'yxatdan o'ting", text: "Hamkor sifatida akkaunt oching va kalitingizni oling." },
  { n: "2", title: "Skriptni ulang", text: "Bir qator kod — mahsulot sahifangizda tugma paydo bo'ladi." },
  { n: "3", title: "Mijoz sinab ko'radi", text: "Foydalanuvchi o'z rasmida kiyimni ko'radi va sotib oladi." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-line bg-beige px-4 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              Virtual kiyib ko&apos;rish
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl font-serif">
              Mijozlaringiz kiyimni{" "}
              <span className="text-accent">o&apos;z rasmida</span>{" "}
              sinab ko&apos;rsin
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              {BRAND} — onlayn kiyim do&apos;konlari uchun virtual kiyib ko&apos;rish xizmati.
              Saytingizga bir qatorda ulang, mijozlar tasavvur qilmasdan ko&apos;rsin.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#partner"
                className="rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-hover"
              >
                Hamkor bo&apos;lish
              </a>
              <Link
                href="/login"
                className="rounded-full border border-line px-6 py-3 font-medium text-primary transition hover:border-accent hover:text-accent"
              >
                Kirish
              </Link>
            </div>
          </div>
          {/* Hero emblem */}
          <div className="flex justify-center">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-[radial-gradient(ellipse_at_center,_#E6DFD0_0%,_#B08D57_100%)] shadow-lg sm:h-80 sm:w-80">
              <Image src="/sim-icon.png" alt="Sima" width={180} height={180} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-primary font-serif">
            Nima uchun {BRAND}
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <h3 className="text-lg font-semibold text-primary">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-primary font-serif">
            Qanday ishlaydi
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership / Registration */}
      <section id="partner" className="border-t border-line bg-beige py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary font-serif">Hamkorlik</h2>
            <p className="mt-4 text-muted">
              Do&apos;koningizni {BRAND}&apos;ga ulang. Ro&apos;yxatdan o&apos;ting,
              kalitingizni oling va xizmatni saytingizda ishga tushiring.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2"><span className="text-accent font-bold">✓</span> Bir qatorlik integratsiya</li>
              <li className="flex items-center gap-2"><span className="text-accent font-bold">✓</span> Dashboard: foydalanish va tarix</li>
              <li className="flex items-center gap-2"><span className="text-accent font-bold">✓</span> Xavfsiz token tizimi</li>
            </ul>
          </div>

          {/* Ro'yxatdan o'tish */}
          <div className="rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
            <h3 className="text-xl font-semibold text-primary">Hoziroq boshlang</h3>
            <p className="mt-2 text-sm text-muted">
              Bir necha daqiqada ro&apos;yxatdan o&apos;tib, do&apos;koningizni ulang.
            </p>
            <Link
              href="/register"
              className="mt-6 block rounded-full bg-accent px-4 py-3 text-center font-medium text-white transition hover:bg-hover"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
            <p className="mt-4 text-center text-sm text-muted">
              Akkauntingiz bormi?{" "}
              <Link href="/login" className="font-medium text-accent hover:text-hover transition-colors">Kirish</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
