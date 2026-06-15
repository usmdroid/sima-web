import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kirish — Sima",
};

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hamkor kabinetiga kirish</h1>
      <p className="mt-2 text-sm text-slate-500">Do&apos;kon akkauntingiz bilan kiring.</p>

      {/* Dummy login formasi — hozircha ishlamaydi, keyin auth ulanadi */}
      <form className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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
          Kirish
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Hamkor emasmisiz?{" "}
        <Link href="/#partner" className="font-medium text-indigo-600 hover:underline">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </section>
  );
}
