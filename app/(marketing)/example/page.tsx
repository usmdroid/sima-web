"use client";

import Script from "next/script";

type SimaTryOn = {
  open: (opts: { cloth: string; type?: string; name?: string }) => void;
  configure: (opts: { getToken: () => Promise<string> }) => void;
};

declare global {
  interface Window {
    SimaTryOn?: SimaTryOn;
  }
}

type Product = {
  name: string;
  cat: string;
  type: string;
  price: string;
  old?: string;
  img: string;
  tag?: string;
  isNew?: boolean;
};

const PRODUCTS: Product[] = [
  { name: "Sport jersi", cat: "Erkaklar · Ustki", type: "upper", price: "380 000", img: "/example/clothes/1.jpg", tag: "Yangi", isNew: true },
  { name: "Yashil mini ko'ylak", cat: "Ayollar · Libos", type: "overall", price: "1 250 000", old: "1 500 000", img: "/example/clothes/2.jpg", tag: "Chegirma" },
  { name: "Oq trikotaj libos", cat: "Ayollar · Libos", type: "overall", price: "890 000", img: "/example/clothes/3.jpg" },
  { name: "Bosma futbolka", cat: "Erkaklar · Ustki", type: "upper", price: "320 000", img: "/example/clothes/4.jpg" },
  { name: "Gulli triko libos", cat: "Ayollar · Libos", type: "overall", price: "1 680 000", img: "/example/clothes/5.jpg", tag: "Yangi", isNew: true },
  { name: "Krem retro libos", cat: "Ayollar · Libos", type: "overall", price: "1 100 000", old: "1 290 000", img: "/example/clothes/6.jpg", tag: "Chegirma" },
  { name: "Snoopy kardigan", cat: "Ayollar · Ustki", type: "upper", price: "640 000", img: "/example/clothes/7.jpg", tag: "Yangi", isNew: true },
  { name: "Tennis jileti", cat: "Unisex · Ustki", type: "upper", price: "420 000", img: "/example/clothes/8.jpg" },
];

/** Vidjetni token oqimiga ulaydi: sk_ server tarafda, brauzer faqat token oladi. */
function configureWidget() {
  window.SimaTryOn?.configure({
    getToken: async () => {
      const res = await fetch("/api/sima-token", { method: "POST" });
      if (!res.ok) throw new Error("token " + res.status);
      return (await res.json()).token as string;
    },
  });
}

export default function ExamplePage() {
  function tryOn(p: Product) {
    if (!window.SimaTryOn) return;
    window.SimaTryOn.open({ cloth: p.img, type: p.type, name: p.name });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Script src="/widget.js" strategy="afterInteractive" onReady={configureWidget} />

      <div className="mb-8">
        <p className="text-sm font-medium text-accent">Demo do&apos;kon</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary font-serif">
          Atlas — namuna integratsiya
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Bu sahifa Sima vidjeti do&apos;kon saytiga qanday ulanishini ko&apos;rsatadi.
          &quot;Sinab ko&apos;rish&quot; tugmasi vidjetni ochadi; token Sima serveridan
          (sk_ brauzerga chiqmaydi) olinadi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(29,29,29,0.04)]"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-beige">
              {p.tag && (
                <span
                  className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.isNew ? "bg-accent text-white" : "bg-accent/80 text-white"
                  }`}
                >
                  {p.tag}
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => tryOn(p)}
                className="absolute inset-x-2 bottom-2 translate-y-2 rounded-full bg-primary/90 py-2 text-sm font-medium text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"
              >
                Sinab ko&apos;rish
              </button>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium text-primary">{p.name}</p>
              <p className="text-xs text-muted">{p.cat}</p>
              <p className="mt-1 text-sm text-primary">
                {p.old && <s className="mr-1 text-muted">{p.old}</s>}
                {p.price} so&apos;m
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
