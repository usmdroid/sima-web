import { getPricing, type PricingInfo } from "@/lib/api";

const FALLBACK: PricingInfo = {
  usdToSim: 100,
  freeGrantSim: 100,
  tiers: [
    { uptoRequests: 1000, simPerRequest: 1.0 },
    { uptoRequests: 10000, simPerRequest: 0.95 },
    { uptoRequests: null, simPerRequest: 0.9 },
  ],
};

async function loadPricing(): Promise<PricingInfo> {
  try {
    return await getPricing();
  } catch {
    return FALLBACK;
  }
}

export default async function NarxlarPage() {
  const pricing = await loadPricing();

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <span className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-medium uppercase tracking-wider text-indigo-700">
          Narxlar
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Oddiy va shaffof narxlar
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Har bir yangi akkauntga <strong>{pricing.freeGrantSim} sim</strong> bepul beriladi.
          1 USD = {pricing.usdToSim} sim.
        </p>
      </section>

      {/* Free grant */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-indigo-200 bg-white p-8 text-center shadow-sm">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
              🎁
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              {pricing.freeGrantSim} sim bepul
            </h2>
            <p className="mt-3 text-slate-600">
              Ro&apos;yxatdan o&apos;tganda hisobingizga avtomatik {pricing.freeGrantSim} sim
              yoziladi — hech qanday karta ma&apos;lumoti kerak emas.
            </p>
          </div>
        </div>
      </section>

      {/* Tier table */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            So&apos;rov narxlari
          </h2>
          <p className="mt-3 text-center text-slate-600">
            Narx jami amalga oshirilgan so&apos;rovlar soniga qarab kamayadi.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Jami so&apos;rovlar</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-700">Har bir so&apos;rov narxi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricing.tiers.map((tier, i) => {
                  const label =
                    i === 0
                      ? `0 – ${(tier.uptoRequests! - 1).toLocaleString()}`
                      : tier.uptoRequests === null
                      ? `${(pricing.tiers[i - 1].uptoRequests!).toLocaleString()} va undan yuqori`
                      : `${(pricing.tiers[i - 1].uptoRequests!).toLocaleString()} – ${(tier.uptoRequests - 1).toLocaleString()}`;
                  return (
                    <tr key={i} className={i === 0 ? "bg-indigo-50/30" : ""}>
                      <td className="px-6 py-4 text-slate-700">{label}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {tier.simPerRequest.toFixed(2)} sim
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Boshlashga tayyormisiz?</h2>
          <p className="mt-3 text-slate-600">
            {pricing.freeGrantSim} sim bepul — kredit kartasisiz ro&apos;yxatdan o&apos;ting.
          </p>
          <a
            href="/register"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-700"
          >
            Bepul boshlash
          </a>
        </div>
      </section>
    </>
  );
}
