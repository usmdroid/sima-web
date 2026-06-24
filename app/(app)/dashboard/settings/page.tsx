"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Mail, Phone, ShieldCheck, Bell } from "lucide-react";
import {
  getSession,
  saveSession,
  type ClientInfo,
  type SecondaryEmail,
  phoneChangeRequest,
  phoneVerify,
  emailChangeRequest,
  emailVerify,
  getSecondaryEmails,
  emailAdd,
  emailVerifySecondary,
  deleteSecondaryEmail,
} from "@/lib/api";
import { Spinner } from "@/app/components/Spinner";
import { Skeleton } from "@/app/components/Skeleton";

// ---- Helpers ----

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

// ---- Toast ----

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed right-5 top-5 z-[100] max-w-sm rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg">
      {msg}
    </div>
  );
}

// ---- Modal wrapper ----

function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-md mx-4 bg-surface rounded-2xl shadow-[0_8px_40px_rgba(29,29,29,0.12)] border border-line"
        style={{ animation: "modalIn 200ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="font-serif text-lg font-semibold text-primary">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="text-muted hover:text-primary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

// ---- Input field ----

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
        className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent bg-bg"
      />
    </div>
  );
}

// ---- Error box ----

function ErrorBox({ msg }: { msg: string }) {
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{msg}</p>;
}

// ---- Accent button ----

function AccentBtn({ children, loading, disabled, onClick, type = "button", full = false }: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  full?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed ${full ? "w-full" : ""}`}
    >
      {loading && <Spinner size={14} className="text-white" />}
      {children}
    </button>
  );
}

// ---- Phone change modal ----

function PhoneModal({ open, onClose, token, currentEmail, onSuccess }: {
  open: boolean;
  onClose: () => void;
  token: string;
  currentEmail: string | null | undefined;
  onSuccess: (phone: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [newPhone, setNewPhone] = useState("+998 ");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<string | null>(null);

  function reset() { setStep(1); setNewPhone("+998 "); setCode(""); setError(null); setDevNote(null); }

  async function onRequest() {
    setError(null);
    const raw = newPhone.replace(/\D/g, "");
    if (raw.length < 12) { setError("Telefon raqamni to'liq kiriting (+998 XX XXX XX XX)."); return; }
    setLoading(true);
    try {
      const r = await phoneChangeRequest(token, "+" + raw);
      if (r.devCode) setDevNote("Dev kodi: " + r.devCode);
      setStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
    finally { setLoading(false); }
  }

  async function onVerify() {
    setError(null);
    if (code.trim().length < 4) { setError("Tasdiqlash kodini kiriting."); return; }
    setLoading(true);
    try {
      const raw = newPhone.replace(/\D/g, "");
      const r = await phoneVerify(token, code.trim(), "+" + raw);
      onSuccess(r.phone);
      reset();
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
    finally { setLoading(false); }
  }

  function handleClose() { reset(); onClose(); }

  return (
    <Modal open={open} onClose={handleClose} title="Telefon raqamni o'zgartirish">
      {step === 1 ? (
        <>
          <p className="text-sm text-muted">OTP kodi joriy email manzilingizga {currentEmail ? <span className="font-medium text-primary">({currentEmail})</span> : ""} yuboriladi.</p>
          <Field
            label="Yangi telefon raqam"
            value={newPhone}
            onChange={(v) => setNewPhone(formatPhone(v))}
            placeholder="+998 90 123 45 67"
            type="tel"
          />
          {error && <ErrorBox msg={error} />}
          <AccentBtn loading={loading} onClick={onRequest} full>OTP yuborish</AccentBtn>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">Kodingizni kiriting.</p>
          {devNote && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{devNote}</div>
          )}
          <Field
            label="OTP kod"
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
          />
          {error && <ErrorBox msg={error} />}
          <AccentBtn loading={loading} onClick={onVerify} full>Tasdiqlash</AccentBtn>
          <button
            type="button"
            onClick={() => { setStep(1); setError(null); setDevNote(null); }}
            className="w-full text-center text-sm text-muted hover:text-primary transition-colors"
          >
            ← Orqaga
          </button>
        </>
      )}
    </Modal>
  );
}

// ---- Primary email change modal ----

function EmailChangeModal({ open, onClose, token, onSuccess }: {
  open: boolean;
  onClose: () => void;
  token: string;
  onSuccess: (email: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<string | null>(null);

  function reset() { setStep(1); setNewEmail(""); setCode(""); setError(null); setDevNote(null); }

  async function onRequest() {
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail.trim())) { setError("Email formati noto'g'ri."); return; }
    setLoading(true);
    try {
      const r = await emailChangeRequest(token, newEmail.trim());
      if (r.devCode) setDevNote("Dev kodi: " + r.devCode);
      setStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
    finally { setLoading(false); }
  }

  async function onVerify() {
    setError(null);
    if (code.trim().length < 4) { setError("Tasdiqlash kodini kiriting."); return; }
    setLoading(true);
    try {
      const r = await emailVerify(token, code.trim(), newEmail.trim());
      onSuccess(r.email);
      reset();
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
    finally { setLoading(false); }
  }

  function handleClose() { reset(); onClose(); }

  return (
    <Modal open={open} onClose={handleClose} title="Asosiy emailni o'zgartirish">
      {step === 1 ? (
        <>
          <p className="text-sm text-muted">OTP kodi yangi email manzilingizga yuboriladi.</p>
          <Field label="Yangi email" value={newEmail} onChange={setNewEmail} placeholder="yangi@email.com" type="email" />
          {error && <ErrorBox msg={error} />}
          <AccentBtn loading={loading} onClick={onRequest} full>OTP yuborish</AccentBtn>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">
            <span className="font-medium text-primary">{newEmail}</span> manziliga kod yuborildi.
          </p>
          {devNote && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{devNote}</div>
          )}
          <Field label="OTP kod" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="123456" />
          {error && <ErrorBox msg={error} />}
          <AccentBtn loading={loading} onClick={onVerify} full>Tasdiqlash</AccentBtn>
          <button type="button" onClick={() => { setStep(1); setError(null); setDevNote(null); }} className="w-full text-center text-sm text-muted hover:text-primary transition-colors">← Orqaga</button>
        </>
      )}
    </Modal>
  );
}

// ---- Add secondary email modal ----

function AddEmailModal({ open, onClose, token, onSuccess }: {
  open: boolean;
  onClose: () => void;
  token: string;
  onSuccess: (entry: SecondaryEmail) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<string | null>(null);

  function reset() { setStep(1); setEmail(""); setCode(""); setError(null); setDevNote(null); }

  async function onRequest() {
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError("Email formati noto'g'ri."); return; }
    setLoading(true);
    try {
      const r = await emailAdd(token, email.trim());
      if (r.devCode) setDevNote("Dev kodi: " + r.devCode);
      setStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
    finally { setLoading(false); }
  }

  async function onVerify() {
    setError(null);
    if (code.trim().length < 4) { setError("Tasdiqlash kodini kiriting."); return; }
    setLoading(true);
    try {
      const r = await emailVerifySecondary(token, code.trim(), email.trim());
      onSuccess({ id: r.id, email: r.email, verified: r.verified, createdAt: new Date().toISOString() });
      reset();
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
    finally { setLoading(false); }
  }

  function handleClose() { reset(); onClose(); }

  return (
    <Modal open={open} onClose={handleClose} title="Email qo'shish">
      {step === 1 ? (
        <>
          <Field label="Email manzil" value={email} onChange={setEmail} placeholder="qo'shimcha@email.com" type="email" />
          {error && <ErrorBox msg={error} />}
          <AccentBtn loading={loading} onClick={onRequest} full>OTP yuborish</AccentBtn>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">
            <span className="font-medium text-primary">{email}</span> manziliga kod yuborildi.
          </p>
          {devNote && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{devNote}</div>
          )}
          <Field label="OTP kod" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="123456" />
          {error && <ErrorBox msg={error} />}
          <AccentBtn loading={loading} onClick={onVerify} full>Tasdiqlash va qo'shish</AccentBtn>
          <button type="button" onClick={() => { setStep(1); setError(null); setDevNote(null); }} className="w-full text-center text-sm text-muted hover:text-primary transition-colors">← Orqaga</button>
        </>
      )}
    </Modal>
  );
}

// ---- Card wrapper ----

function Card({ title, icon, children, animDelay = 0 }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  animDelay?: number;
}) {
  return (
    <div
      className="rounded-2xl border border-line bg-surface shadow-[0_1px_4px_rgba(29,29,29,0.06)] overflow-hidden"
      style={{ animation: `cardIn 200ms ${animDelay}ms cubic-bezier(0.16,1,0.3,1) both` }}
    >
      <div className="flex items-center gap-3 px-6 py-5 border-b border-line">
        <span className="text-accent">{icon}</span>
        <h2 className="font-serif text-lg font-semibold text-primary">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ---- Info row ----

function InfoRow({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-line last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
        <div className="mt-0.5 text-sm text-primary font-medium truncate">{value}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ---- Small ghost button ----

function GhostBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-50 hover:text-red-600"
          : "text-accent hover:bg-beige hover:text-hover"
      }`}
    >
      {children}
    </button>
  );
}

// ---- Main page ----

export default function SettingsPage() {
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [secondaryEmails, setSecondaryEmails] = useState<SecondaryEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [phoneModal, setPhoneModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [addEmailModal, setAddEmailModal] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [notifEmail, setNotifEmail] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setClient(s.client);
    setToken(s.token);
    loadSecondaryEmails(s.token);
  }, []);

  async function loadSecondaryEmails(t: string) {
    setEmailsLoading(true);
    try {
      const list = await getSecondaryEmails(t);
      setSecondaryEmails(list);
    } catch {
      // non-fatal
    } finally {
      setEmailsLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
  }

  function onPhoneSuccess(phone: string) {
    setClient((prev) => prev ? { ...prev, phone } : prev);
    const s = getSession();
    if (s) saveSession({ ...s, client: { ...s.client, phone } });
    showToast("Telefon raqam muvaffaqiyatli o'zgartirildi.");
  }

  function onEmailSuccess(email: string) {
    setClient((prev) => prev ? { ...prev, email } : prev);
    const s = getSession();
    if (s) saveSession({ ...s, client: { ...s.client, email } });
    showToast("Asosiy email muvaffaqiyatli o'zgartirildi.");
  }

  function onSecondaryAdded(entry: SecondaryEmail) {
    setSecondaryEmails((prev) => [...prev, entry]);
    showToast("Email muvaffaqiyatli qo'shildi va tasdiqlandi.");
  }

  async function onDeleteSecondary(id: string) {
    if (!token) return;
    setDeletingId(id);
    try {
      await deleteSecondaryEmail(token, id);
      setSecondaryEmails((prev) => prev.filter((e) => e.id !== id));
      showToast("Email o'chirildi.");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "O'chirishda xatolik.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!client || !token) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Modals */}
      <PhoneModal
        open={phoneModal}
        onClose={() => setPhoneModal(false)}
        token={token}
        currentEmail={client.email}
        onSuccess={onPhoneSuccess}
      />
      <EmailChangeModal
        open={emailModal}
        onClose={() => setEmailModal(false)}
        token={token}
        onSuccess={onEmailSuccess}
      />
      <AddEmailModal
        open={addEmailModal}
        onClose={() => setAddEmailModal(false)}
        token={token}
        onSuccess={onSecondaryAdded}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary">Sozlamalar</h1>
          <p className="mt-1 text-sm text-muted">Profil, xavfsizlik va bildirishnomalarni boshqaring.</p>
        </div>

        {/* Card 1: Profil */}
        <Card title="Profil ma'lumotlari" icon={<Phone size={18} />} animDelay={0}>
          <InfoRow
            label="Telefon raqam"
            value={client.phone || "—"}
            action={<GhostBtn onClick={() => setPhoneModal(true)}>O&apos;zgartirish</GhostBtn>}
          />
          <InfoRow
            label="Asosiy email"
            value={
              <span className="flex items-center gap-1.5">
                {client.email || <span className="text-muted italic">Belgilanmagan</span>}
                {client.email && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle size={11} /> Tasdiqlangan
                  </span>
                )}
              </span>
            }
            action={<GhostBtn onClick={() => setEmailModal(true)}>O&apos;zgartirish</GhostBtn>}
          />

          {/* Secondary emails */}
          <div className="pt-3">
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-2">Qo'shimcha emaillar</p>
            {emailsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-3/4" />
              </div>
            ) : secondaryEmails.length === 0 ? (
              <p className="text-sm text-muted italic py-1">Qo'shimcha email yo'q.</p>
            ) : (
              <ul className="space-y-1.5">
                {secondaryEmails.map((se) => (
                  <li
                    key={se.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 bg-bg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={13} className="text-muted shrink-0" />
                      <span className="text-sm text-primary truncate">{se.email}</span>
                      <span className="inline-flex items-center rounded-full bg-beige px-2 py-0.5 text-xs font-medium text-muted">
                        Qo&apos;shimcha
                      </span>
                      {se.verified && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle size={10} /> Tasdiqlangan
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteSecondary(se.id)}
                      disabled={deletingId === se.id}
                      className="shrink-0 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === se.id ? <Spinner size={13} className="text-red-500" /> : "O'chirish"}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => setAddEmailModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-hover transition-colors"
            >
              <span className="text-base leading-none">+</span> Email qo&apos;shish
            </button>
          </div>
        </Card>

        {/* Card 2: Xavfsizlik */}
        <Card title="Xavfsizlik" icon={<ShieldCheck size={18} />} animDelay={60}>
          <div className="space-y-2">
            {[
              { label: "Parol o'zgartirish" },
              { label: "Ikki bosqichli tekshiruv (2FA)" },
              { label: "Faol seanslar" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3 border-b border-line last:border-0"
              >
                <span className="text-sm text-primary font-medium">{item.label}</span>
                <button
                  type="button"
                  disabled
                  className="text-sm font-medium px-3 py-1.5 rounded-lg bg-disabled text-muted cursor-not-allowed"
                >
                  Tez kunda
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Card 3: Bildirishnomalar */}
        <Card title="Bildirishnomalar" icon={<Bell size={18} />} animDelay={120}>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-primary">Email bildirishnomalar</p>
              <p className="text-xs text-muted mt-0.5">Hisob faoliyati haqida emailga xabar olish</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifEmail}
              onClick={() => setNotifEmail((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifEmail ? "bg-accent" : "bg-line"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  notifEmail ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
