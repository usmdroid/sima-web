"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, sendOtp, saveSession } from "@/lib/api";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("register");
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
  const [copied, setCopied] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  function startCountdown() {
    setResendCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          showToast(t("resendAvailable"), 5000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function showToast(msg: string, duration = 6000) {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }

  function showCode(devCode?: string) {
    if (!devCode) return;
    showToast(t("devOtp", { code: devCode }), 8000);
  }

  async function onContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !password) {
      setError(t("errorRequired"));
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError(t("errorPhone"));
      return;
    }
    if (!email.trim()) {
      setError(t("errorEmailRequired"));
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError(t("errorEmailFormat"));
      return;
    }
    if (password.length < 6) {
      setError(t("errorPasswordLength"));
      return;
    }
    if (password !== confirm) {
      setError(t("errorPasswordMatch"));
      return;
    }
    setLoading(true);
    try {
      const r = await sendOtp(email.trim());
      showCode(r.devCode);
      showToast(t("codeSent"), 4000);
      setStep(2);
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorRequired"));
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) {
      setError(t("errorCodeRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await register({ name, phone, email: email.trim(), password, code: code.trim() });
      saveSession(res);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorRequired"));
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (resendCountdown > 0) return;
    setError(null);
    try {
      const r = await sendOtp(email.trim());
      showCode(r.devCode);
      showToast(t("codeSent"), 4000);
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorRequired"));
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-16">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-primary font-serif">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">
        {step === 1 ? t("step1Subtitle") : t("step2Subtitle")}
      </p>

      {step === 1 ? (
        <form onSubmit={onContinue} className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <Field label={t("shopName")} value={name} onChange={setName} placeholder="ATLAS Store" />
          <Field label={t("phone")} value={phone} onChange={(v) => setPhone(formatPhone(v))} placeholder="+998 90 123 45 67" type="tel" />
          <Field label={t("email")} value={email} onChange={setEmail} placeholder="siz@dokon.uz" type="email" />
          <Field label={t("password")} value={password} onChange={setPassword} placeholder="••••••••" type="password" />
          <Field label={t("confirmPassword")} value={confirm} onChange={setConfirm} placeholder="••••••••" type="password" />

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0">
            {loading && <Spinner size={14} className="text-white" />}
            {loading ? t("sending") : t("continue")}
          </button>
          <p className="text-center text-sm text-muted">
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-medium text-accent hover:text-hover transition-colors">{t("login")}</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={onVerify} className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
          <p className="text-sm text-muted">
            {t("codeSentTo", { email })}
          </p>
          <div className="relative">
            <Field label={t("verifyCode")} value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="123456" type="text" />
            <button
              type="button"
              disabled={code.trim().length === 0}
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="mt-1 text-xs text-accent hover:text-hover transition-colors disabled:opacity-40"
            >
              {copied ? t("copied") : t("copyCode")}
            </button>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0">
            {loading && <Spinner size={14} className="text-white" />}
            {loading ? t("verifying") : t("verifyAndRegister")}
          </button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => { setStep(1); setError(null); setResendCountdown(0); if (countdownRef.current) clearInterval(countdownRef.current); }} className="text-muted hover:text-primary transition-colors">{t("back")}</button>
            <button
              type="button"
              onClick={onResend}
              disabled={resendCountdown > 0}
              className="text-accent hover:text-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCountdown > 0 ? t("resendIn", { sec: resendCountdown }) : t("resend")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-primary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-bg"
      />
    </div>
  );
}
