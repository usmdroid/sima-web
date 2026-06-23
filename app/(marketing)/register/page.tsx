"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, sendOtp, saveSession } from "@/lib/api";
import { Spinner } from "@/app/components/Spinner";

/** Telefon mask: default +998, "+998 90 123 45 67". Boshqa kod yozilsa — erkin. */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits.startsWith("998")) return digits ? "+" + digits : "";
  const rest = digits.slice(3, 12);
  let out = "+998";
  if (rest.length > 0) out += " " + rest.slice(0, 2);
  if (rest.length > 2) out += " " + rest.slice(2, 5);
  if (rest.length > 5) out += " " + rest.slice(5, 7);
  if (rest.length > 7) out += " " + rest.slice(7, 9);
  return out;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showCode(devCode?: string) {
    if (!devCode) return;
    setToast("OTP kod: " + devCode);
    setTimeout(() => setToast(null), 8000);
  }

  async function onContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !password) {
      setError("Do'kon nomi, telefon va parol to'ldirilishi shart.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Telefon raqamni to'liq kiriting.");
      return;
    }
    if (!email.trim()) {
      setError("Email to'ldirilishi shart.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Email formati noto'g'ri.");
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
      const r = await sendOtp(email.trim());
      showCode(r.devCode);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) {
      setError("Tasdiqlash kodini kiriting.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ name, phone, email: email.trim(), password, code: code.trim() });
      saveSession(res);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError(null);
    try {
      const r = await sendOtp(email.trim());
      showCode(r.devCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod yuborilmadi");
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-16">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-primary font-serif">Hamkor bo&apos;lish</h1>
      <p className="mt-2 text-sm text-muted">
        {step === 1 ? "Do'koningizni ro'yxatdan o'tkazing." : "Email manzilingizga yuborilgan kodni kiriting."}
      </p>

      {step === 1 ? (
        <form onSubmit={onContinue} className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <Field label="Do'kon nomi" value={name} onChange={setName} placeholder="ATLAS Store" />
          <Field label="Telefon raqam" value={phone} onChange={(v) => setPhone(formatPhone(v))} placeholder="+998 90 123 45 67" type="tel" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="siz@dokon.uz" type="email" />
          <Field label="Parol" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
          <Field label="Parolni takrorlang" value={confirm} onChange={setConfirm} placeholder="••••••••" type="password" />

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0">
            {loading && <Spinner size={14} className="text-white" />}
            {loading ? "Yuborilmoqda…" : "Davom etish"}
          </button>
          <p className="text-center text-sm text-muted">
            Akkauntingiz bormi? <Link href="/login" className="font-medium text-accent hover:text-hover transition-colors">Kirish</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={onVerify} className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-sm text-muted">
            <span className="font-medium text-primary">{email}</span> manziliga tasdiqlash kodi yuborildi.
          </p>
          <Field label="Tasdiqlash kodi" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="123456" type="text" />

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0">
            {loading && <Spinner size={14} className="text-white" />}
            {loading ? "Tekshirilmoqda…" : "Tasdiqlash va ro'yxatdan o'tish"}
          </button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => { setStep(1); setError(null); }} className="text-muted hover:text-primary transition-colors">← Orqaga</button>
            <button type="button" onClick={onResend} className="text-accent hover:text-hover transition-colors">Kodni qayta yuborish</button>
          </div>
        </form>
      )}
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
      <label className="mb-1 block text-sm font-medium text-primary">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-bg"
      />
    </div>
  );
}
