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
