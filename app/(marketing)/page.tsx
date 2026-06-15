import Link from "next/link";

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
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <span className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-medium uppercase tracking-wider text-indigo-700">
          Virtual kiyib ko&apos;rish
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
          Mijozlaringiz kiyimni <span className="text-indigo-600">o&apos;z rasmida</span> sinab ko&apos;rsin
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Sima — onlayn kiyim do&apos;konlari uchun virtual kiyib ko&apos;rish xizmati.
          Saytingizga bir qatorda ulang, mijozlar tasavvur qilmasdan ko&apos;rsin.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#partner"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
          >
            Hamkor bo&apos;lish
          </a>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Kirish
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Nima uchun Sima
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Qanday ishlaydi
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership / Registration */}
      <section id="partner" className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Hamkorlik</h2>
            <p className="mt-4 text-slate-600">
              Do&apos;koningizni Sima&apos;ga ulang. Ro&apos;yxatdan o&apos;ting,
              kalitingizni oling va xizmatni saytingizda ishga tushiring.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>✓ Bir qatorlik integratsiya</li>
              <li>✓ Dashboard: foydalanish va tarix</li>
              <li>✓ Xavfsiz token tizimi</li>
            </ul>
          </div>

          {/* Dummy registratsiya formasi — hozircha ishlamaydi, keyin ulaymiz */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Hamkor bo&apos;lish</h3>
            <p className="mt-1 text-sm text-slate-500">Ro&apos;yxatdan o&apos;tish (tez orada)</p>
            <form className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Do&apos;kon nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: ATLAS Store"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="siz@dokon.uz"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Parol</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
              >
                Ro&apos;yxatdan o&apos;tish
              </button>
              <p className="text-center text-sm text-slate-500">
                Akkauntingiz bormi?{" "}
                <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                  Kirish
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
