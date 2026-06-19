// Backend API bilan aloqa (auth) + sessiya saqlash.
// Eslatma: hozircha token localStorage'da. Keyingi bosqich — httpOnly cookie (BFF).

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://tryon-backend-production-92ad.up.railway.app/api";

export interface ClientInfo {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export interface AuthResult {
  token: string;
  client: ClientInfo;
}

async function postJson(path: string, body: unknown): Promise<AuthResult> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
  }
  return json as AuthResult;
}

/** Telefonga OTP yuboradi. Dev rejimida javobda devCode qaytishi mumkin (toast uchun). */
export async function sendOtp(phone: string): Promise<{ devCode?: string }> {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Kod yuborib bo'lmadi.");
  }
  return json;
}

export function register(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  code: string;
}): Promise<AuthResult> {
  return postJson("/auth/register", data);
}

export function login(identifier: string, password: string): Promise<AuthResult> {
  return postJson("/auth/login", { identifier, password });
}

// ---- Sessiya (localStorage) ----
const KEY = "sima_session";

export function saveSession(r: AuthResult) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(r));
}

export function getSession(): AuthResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResult;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

// ---- API Kalitlar ----

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  key: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface CreatedApiKey {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  createdAt: string;
}

export async function listApiKeys(token: string): Promise<ApiKey[]> {
  const res = await fetch(`${API_BASE}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
  return json as ApiKey[];
}

export async function createApiKey(token: string, name: string): Promise<CreatedApiKey> {
  const res = await fetch(`${API_BASE}/api-keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
  return json as CreatedApiKey;
}

export async function revokeApiKey(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api-keys/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
}

// ---- Hamyon (Wallet) ----

export interface WalletInfo {
  balanceSim: number;
  balanceMsim: number;
  totalRequests: number;
  freeGrantSim: number;
}

export interface WalletTransaction {
  id: string;
  amountSim: number;
  type: string;
  balanceAfterSim: number;
  createdAt: string;
}

export interface PricingTier {
  uptoRequests: number | null;
  simPerRequest: number;
}

export interface PricingInfo {
  usdToSim: number;
  freeGrantSim: number;
  tiers: PricingTier[];
}

export async function getPricing(): Promise<PricingInfo> {
  const res = await fetch(`${API_BASE}/pricing`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Narxlarni yuklab bo'lmadi.");
  return json as PricingInfo;
}

export async function getWallet(token: string): Promise<WalletInfo> {
  const res = await fetch(`${API_BASE}/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Hamyonni yuklab bo'lmadi.");
  return json as WalletInfo;
}

export async function getWalletTransactions(
  token: string,
  limit = 50
): Promise<WalletTransaction[]> {
  const res = await fetch(`${API_BASE}/wallet/transactions?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Tranzaksiyalarni yuklab bo'lmadi.");
  return json as WalletTransaction[];
}

export async function purchaseCredits(
  token: string,
  amountUsd: number
): Promise<WalletInfo> {
  const res = await fetch(`${API_BASE}/wallet/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amountUsd }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Sim sotib olishda xatolik.");
  return json as WalletInfo;
}
