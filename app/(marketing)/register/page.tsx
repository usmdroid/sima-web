"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, saveSession } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !password) {
      setError("Do'kon nomi, telefon va parol to'ldirilishi shart.");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lsin.");
      return;
    }
    if (password !== confirm) {
      setError("Parollar mos kelmadi.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ name, phone, email: email.trim() || undefined, password });
      saveSession(res);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hamkor bo&apos;lish</h1>
      <p className="mt-2 text-sm text-slate-500">Do&apos;koningizni ro&apos;yxatdan o&apos;tkazing.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Field label="Do'kon nomi" value={name} onChange={setName} placeholder="ATLAS Store" />
        <Field label="Telefon raqam" value={phone} onChange={setPhone} placeholder="+998 90 123 45 67" type="tel" />
        <Field label="Email (ixtiyoriy)" value={email} onChange={setEmail} placeholder="siz@dokon.uz" type="email" required={false} />
        <Field label="Parol" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
        <Field label="Parolni takrorlang" value={confirm} onChange={setConfirm} placeholder="••••••••" type="password" />

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Yuborilmoqda…" : "Ro'yxatdan o'tish"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Akkauntingiz bormi?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">Kirish</Link>
        </p>
      </form>
    </section>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
