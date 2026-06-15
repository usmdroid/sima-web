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

export function register(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
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
