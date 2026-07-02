"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import Reveal from "@/app/components/Reveal";
import CountUp from "@/app/components/CountUp";
import { useVariant } from "@/app/hooks/useVariant";
import { logVariant } from "@/app/lib/ab";

const WIDGET_CODE = `<!-- Sima widget -->
<script
  src="https://cdn.trysima.uz/widget.js"
  data-key="YOUR_PUBLIC_KEY">
</script>`;

const STATS_FALLBACK = { partners: 3, tryOns: 100, months: 6, uptime: 99.5 };

export default function LandingClient() {
  const t = useTranslations("marketing");
  const heroVariant = useVariant("hero-heading");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const textureRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState(STATS_FALLBACK);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_API_BASE ?? "https://api.trysima.uz/api";
    fetch(`${base}/public/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (textureRef.current) {
        textureRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          ref={textureRef}
          className="pointer-events-none absolute inset-x-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: "url('/texture.webp')", top: "-30%", bottom: "-30%" }}
        />
        <section className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center sm:pt-32">
          <span
            className="anim-fade-up inline-block rounded-full border border-line bg-beige px-4 py-1 text-xs font-medium uppercase tracking-wider text-accent"
            style={{ animationDelay: "60ms" }}
          >
            {t("heroBadge")}
          </span>
          <h1
            className="anim-fade-up mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-primary sm:text-6xl"
            style={{ animationDelay: "160ms" }}
            onMouseEnter={() => logVariant("hero-heading", heroVariant, "hover")}
          >
            {heroVariant === "B" ? t("heroHeadingB") : t("heroHeading")}
          </h1>
          <p
            className="anim-fade-up mx-auto mt-6 max-w-2xl text-lg text-muted"
            style={{ animationDelay: "280ms" }}
          >
            {t("heroDesc", { brand: BRAND })}
          </p>
          <div
            className="anim-fade-up mt-9 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "400ms" }}
          >
            <a
              href="#partner"
              className="btn-shine rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-hover hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(176,141,87,0.35)] active:translate-y-0 active:shadow-none"
            >
              {t("heroCta")}
            </a>
            <Link
              href="/login"
              className="rounded-full border border-line px-6 py-3 font-medium text-primary transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              {t("heroLogin")}
            </Link>
          </div>
        </section>
      </div>

      {/* Stats */}
      <section className="border-t border-line py-14">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Reveal>
              <div className="text-center">
                <p className="font-serif text-4xl font-bold text-accent">
                  <CountUp end={stats.partners} />+
                </p>
                <p className="mt-1 text-sm font-medium text-muted">
                  {t("statsPartnersLabel")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="text-center">
                <p className="font-serif text-4xl font-bold text-accent">
                  <CountUp end={stats.tryOns} />+
                </p>
                <p className="mt-1 text-sm font-medium text-muted">
                  {t("statsTryOnsLabel")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="text-center">
                <p className="font-serif text-4xl font-bold text-accent">
                  <CountUp end={stats.months} />
                  {t("statsMonthsSuffix")}
                </p>
                <p className="mt-1 text-sm font-medium text-muted">
                  {t("statsMonthsLabel")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="text-center">
                <p className="font-serif text-4xl font-bold text-accent">
                  <CountUp end={stats.uptime} decimals={1} />%
                </p>
                <p className="mt-1 text-sm font-medium text-muted">
                  {t("statsUptimeLabel")}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
              {t("featuresHeading", { brand: BRAND })}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="group h-full rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(29,29,29,0.04)] transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_10px_28px_rgba(176,141,87,0.16)]">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 transition-transform duration-300 group-hover:scale-110">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
              {t("howHeading")}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="group text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-white shadow-[0_4px_12px_rgba(176,141,87,0.25)] transition-transform duration-300 group-hover:scale-110">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section id="integration" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
                  {t("integrationHeading")}
                </h2>
                <p className="mt-4 text-muted">{t("integrationDesc")}</p>
                <div className="mt-8 space-y-6">
                  {integrationSteps.map((s) => (
                    <div key={s.n} className="group flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110">
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
            </Reveal>
            <Reveal delay={150}>
              <pre className="overflow-x-auto rounded-2xl bg-[#1D1D1D] px-6 py-6 font-mono text-sm leading-relaxed text-[#E6DFD0] shadow-[0_8px_30px_rgba(29,29,29,0.18)]">
                <code>{WIDGET_CODE}</code>
              </pre>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
              {t("pricingHeading")}
            </h2>
            <p className="mt-4 text-center text-muted">{t("pricingDesc")}</p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { name: t("pricingTrial"),    price: t("pricingTrialCredits"),    range: t("pricingTrialDesc"),    accent: false },
              { name: t("pricingStandard"), price: t("pricingStandardCredits"), range: t("pricingStandardDesc"), accent: true  },
              { name: t("pricingPro"),      price: t("pricingProCredits"),      range: t("pricingProDesc"),      accent: false },
            ].map((tier, i) => (
              <Reveal key={tier.name} delay={i * 110}>
                <div
                  className={`h-full rounded-2xl p-8 text-center transition duration-300 hover:-translate-y-1.5 ${
                    tier.accent
                      ? "border-2 border-accent bg-surface shadow-[0_4px_24px_rgba(176,141,87,0.15)] hover:shadow-[0_14px_38px_rgba(176,141,87,0.28)] sm:-translate-y-2 sm:hover:-translate-y-3.5"
                      : "border border-line bg-surface shadow-[0_1px_2px_rgba(29,29,29,0.04)] hover:border-accent/60 hover:shadow-[0_12px_30px_rgba(176,141,87,0.14)]"
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wider ${tier.accent ? "text-accent" : "text-muted"}`}>
                    {tier.name}
                  </p>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="font-serif text-4xl font-bold text-primary">{tier.price}</span>
                    <span className="text-base font-medium text-accent">SIM</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{t("pricingPerRequest")}</p>
                  <div className="mt-5 border-t border-line pt-5">
                    <p className="text-sm font-medium text-primary">{tier.range}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={150}>
            <div className="mt-8 text-center">
              <Link
                href="/register"
                className="btn-shine inline-block rounded-full bg-accent px-8 py-3 font-medium text-white transition hover:bg-hover hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(176,141,87,0.35)] active:translate-y-0 active:shadow-none"
              >
                {t("pricingTrialCta")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-line bg-beige py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-primary">
              {t("faqHeading")}
            </h2>
          </Reveal>
          <div className="mt-10 space-y-2">
            {faqItems.map((item, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={i} delay={i * 60}>
                  <div className="overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent/50">
                    <button
                      className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-primary transition-colors hover:text-accent"
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180 text-accent" : ""}`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partnership / Registration */}
      <section id="partner" className="border-t border-line bg-beige py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
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
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(176,141,87,0.16)]">
              <h3 className="text-xl font-semibold text-primary">{t("partnerCtaTitle")}</h3>
              <p className="mt-2 text-sm text-muted">{t("partnerCtaDesc")}</p>
              <Link
                href="/register"
                className="btn-shine mt-6 block rounded-full bg-accent px-4 py-3 text-center font-medium text-white transition hover:bg-hover hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(176,141,87,0.35)] active:translate-y-0 active:shadow-none"
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
