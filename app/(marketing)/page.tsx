"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

const WIDGET_CODE = `<!-- Sima widget -->
<script
  src="https://cdn.trysima.uz/widget.js"
  data-key="YOUR_PUBLIC_KEY">
</script>`;

export default function LandingPage() {
  const t = useTranslations("marketing");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const integrationSteps = [
    { n: "1", title: t("integrationStep0Title"), text: t("integrationStep0Text") },
    { n: "2", title: t("integrationStep1Title"), text: t("integrationStep1Text") },
    { n: "3", title: t("integrationStep2Title"), text: t("integrationStep2Text") },
  ];

  const faqItems = [
    { q: t("faq0Q"), a: t("faq0A") },
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ];

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/texture.webp')" }}
        />
        <section className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center sm:pt-32">
          <span className="inline-block rounded-full border border-line bg-beige px-4 py-1 text-xs font-medium uppercase tracking-wider text-accent">
            {t("heroBadge")}
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-primary sm:text-6xl">
            {t("heroHeading")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            {t("heroDesc", { brand: BRAND })}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#partner"
              className="rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.3)] active:translate-y-0 active:shadow-none"
            >
              {t("heroCta")}
            </a>
            <Link
              href="/login"
              className="rounded-full border border-line px-6 py-3 font-medium text-primary transition hover:border-accent hover:text-accent"
            >
              {t("heroLogin")}
            </Link>
          </div>
        </section>
      </div>

      {/* Features */}
      <section id="features" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
            {t("featuresHeading", { brand: BRAND })}
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)] transition-[border-color,box-shadow] hover:border-accent/60 hover:shadow-[0_4px_16px_rgba(176,141,87,0.12)]"
              >
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
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
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

      {/* Integration */}
      <section id="integration" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
                {t("integrationHeading")}
              </h2>
              <p className="mt-4 text-muted">{t("integrationDesc")}</p>
              <div className="mt-8 space-y-6">
                {integrationSteps.map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {s.n}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted/70">{t("integrationNote")}</p>
            </div>
            <div>
              <pre className="overflow-x-auto rounded-2xl bg-[#1D1D1D] px-6 py-6 font-mono text-sm leading-relaxed text-[#E6DFD0]">
                <code>{WIDGET_CODE}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
            {t("pricingHeading")}
          </h2>
          <p className="mt-4 text-center text-muted">{t("pricingDesc")}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Trial */}
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("pricingTrial")}</p>
              <p className="mt-3 font-serif text-2xl font-bold text-primary">{t("pricingTrialCredits")}</p>
              <p className="text-sm text-muted">{t("pricingTrialDesc")}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {[t("pricingTrialFeature0"), t("pricingTrialFeature1"), t("pricingTrialFeature2")].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="font-bold text-accent">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block rounded-full bg-accent px-4 py-3 text-center font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.3)] active:translate-y-0 active:shadow-none"
              >
                {t("pricingTrialCta")}
              </Link>
            </div>

            {/* Standard — highlighted */}
            <div className="relative rounded-2xl border-2 border-accent bg-surface p-8 shadow-[0_4px_24px_rgba(176,141,87,0.15)]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-0.5 text-xs font-semibold text-white">
                {t("pricingPopular")}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">{t("pricingStandard")}</p>
              <p className="mt-3 font-serif text-2xl font-bold text-primary">{t("pricingStandardCredits")}</p>
              <p className="text-sm text-muted">{t("pricingStandardDesc")}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {[t("pricingStandardFeature0"), t("pricingStandardFeature1"), t("pricingStandardFeature2")].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="font-bold text-accent">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-8 w-full cursor-not-allowed rounded-full border border-line px-4 py-3 text-center font-medium text-muted"
              >
                {t("pricingStandardCta")}
              </button>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("pricingPro")}</p>
              <p className="mt-3 font-serif text-2xl font-bold text-primary">{t("pricingProCredits")}</p>
              <p className="text-sm text-muted">{t("pricingProDesc")}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {[t("pricingProFeature0"), t("pricingProFeature1"), t("pricingProFeature2")].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="font-bold text-accent">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${BRAND_EMAIL}`}
                className="mt-8 block rounded-full border border-accent px-4 py-3 text-center font-medium text-accent transition hover:bg-accent hover:text-white"
              >
                {t("pricingProCta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
            {t("faqHeading")}
          </h2>
          <div className="mt-10 space-y-2">
            {faqItems.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-line bg-surface">
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-primary transition-colors hover:text-accent"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-muted">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership / Registration */}
      <section id="partner" className="border-t border-line bg-beige py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">{t("partnerHeading")}</h2>
            <p className="mt-4 text-muted">{t("partnerDesc", { brand: BRAND })}</p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              {partnerFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="font-bold text-accent">✓</span> {f}
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
              <Link href="/login" className="font-medium text-accent transition-colors hover:text-hover">
                {t("partnerLogin")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
