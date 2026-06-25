"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function LandingPage() {
  const t = useTranslations("marketing");

  const features = [
    { title: t("feature0Title"), text: t("feature0Text") },
    { title: t("feature1Title"), text: t("feature1Text") },
    { title: t("feature2Title"), text: t("feature2Text") },
    { title: t("feature3Title"), text: t("feature3Text") },
  ];

  const steps = [
    { n: "1", title: t("step0Title"), text: t("step0Text") },
    { n: "2", title: t("step1Title"), text: t("step1Text") },
    { n: "3", title: t("step2Title"), text: t("step2Text") },
  ];

  const partnerFeatures = [
    t("partnerFeature0"),
    t("partnerFeature1"),
    t("partnerFeature2"),
  ];

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/texture.webp')" }}
        />
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-line bg-beige px-4 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              {t("heroBadge")}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl font-serif">
              {t("heroHeading")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              {t("heroDesc", { brand: BRAND })}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#partner"
                className="rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.3)] active:translate-y-0 active:shadow-none"
              >
                {t("heroCta")}
              </a>
              <Link
                href="/login"
                className="rounded-full border border-line px-6 py-3 font-medium text-primary transition hover:bg-[#FAF7F2] hover:border-accent hover:text-accent"
              >
                {t("heroLogin")}
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-[radial-gradient(ellipse_at_center,_#E6DFD0_0%,_#B08D57_100%)] shadow-lg sm:h-80 sm:w-80">
              <Image src="/sim-icon.png" alt="Sima" width={180} height={180} priority />
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Features */}
      <section id="features" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-primary font-serif">
            {t("featuresHeading", { brand: BRAND })}
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)] transition-[border-color,box-shadow] hover:border-accent/60 hover:shadow-[0_4px_16px_rgba(176,141,87,0.12)]">
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
            {t("howHeading")}
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
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
            <h2 className="text-3xl font-bold tracking-tight text-primary font-serif">{t("partnerHeading")}</h2>
            <p className="mt-4 text-muted">
              {t("partnerDesc", { brand: BRAND })}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              {partnerFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-accent font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
            <h3 className="text-xl font-semibold text-primary">{t("partnerCtaTitle")}</h3>
            <p className="mt-2 text-sm text-muted">{t("partnerCtaDesc")}</p>
            <Link
              href="/register"
              className="mt-6 block rounded-full bg-accent px-4 py-3 text-center font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.3)] active:translate-y-0 active:shadow-none"
            >
              {t("partnerCta")}
            </Link>
            <p className="mt-4 text-center text-sm text-muted">
              {t("partnerHaveAccount")}{" "}
              <Link href="/login" className="font-medium text-accent hover:text-hover transition-colors">{t("partnerLogin")}</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
