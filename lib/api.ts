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
  role: "CLIENT" | "SUPER_ADMIN";
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

/** Email manzilga OTP yuboradi. Dev rejimida javobda devCode qaytishi mumkin (toast uchun). */
export async function sendOtp(email: string): Promise<{ devCode?: string }> {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
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
  email: string;
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
  revealable: boolean;
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

// ---- Connect (OAuth-uslubida kalit ulash) ----

export interface ConnectAuthorizeResult {
  code: string;
}

export async function connectAuthorize(
  token: string,
  payload: { apiKeyId: string; redirectUri: string; state: string | null }
): Promise<ConnectAuthorizeResult> {
  const res = await fetch(`${API_BASE}/connect/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Ulanishda xatolik yuz berdi.");
  return json as ConnectAuthorizeResult;
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

// ---- Monitoring ----

export interface MonitoringSummary {
  totalRequests: number;
  totalSpentSim: number;
  balanceSim: number;
  keysCount: number;
}

export interface MonitoringByKey {
  apiKeyId: string | null;
  name: string;
  keyPrefix: string | null;
  requests: number;
  spentSim: number;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export type MonitoringRange = "hourly" | "daily" | "weekly" | "monthly";

export interface MonitoringBucket {
  ts: string;
  count: number;
  spentSim: number;
}

export interface MonitoringTimeseries {
  range: string;
  buckets: MonitoringBucket[];
}

export async function getMonitoringSummary(
  token: string
): Promise<MonitoringSummary> {
  const res = await fetch(`${API_BASE}/monitoring/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Monitoringni yuklab bo'lmadi.");
  return json as MonitoringSummary;
}

export async function getMonitoringByKey(
  token: string
): Promise<MonitoringByKey[]> {
  const res = await fetch(`${API_BASE}/monitoring/by-key`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Monitoringni yuklab bo'lmadi.");
  return json as MonitoringByKey[];
}

export async function getMonitoringTimeseries(
  token: string,
  range: MonitoringRange,
  apiKeyId?: string | null
): Promise<MonitoringTimeseries> {
  const params = new URLSearchParams({ range });
  if (apiKeyId) params.set("apiKeyId", apiKeyId);
  const res = await fetch(`${API_BASE}/monitoring/timeseries?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Diagrammani yuklab bo'lmadi.");
  return json as MonitoringTimeseries;
}

// ---- Tarix (history) ----

export interface MonitoringHistoryItem {
  id: string;
  createdAt: string;
  apiKeyId: string | null;
  keyName: string | null;
  keyPrefix: string | null;
  result: string;
  spentSim: number;
}

export interface MonitoringHistory {
  items: MonitoringHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function getMonitoringHistory(
  token: string,
  opts?: { apiKeyId?: string | null; limit?: number; offset?: number }
): Promise<MonitoringHistory> {
  const params = new URLSearchParams();
  if (opts?.apiKeyId) params.set("apiKeyId", opts.apiKeyId);
  if (opts?.limit != null) params.set("limit", String(opts.limit));
  if (opts?.offset != null) params.set("offset", String(opts.offset));
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/monitoring/history${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Tarixni yuklab bo'lmadi.");
  return json as MonitoringHistory;
}

// ---- Admin (Super-Admin + RBAC) ----

export interface AdminClient {
  id: string;
  name: string;
  phone: string;
  balanceSim: number;
  totalRequests: number;
  status: "ACTIVE" | "SUSPENDED";
  role: "CLIENT" | "SUPER_ADMIN";
  createdAt: string;
}

export interface AdminClientTransaction {
  id: string;
  amountSim: number;
  type: string;
  balanceAfterSim: number;
  createdAt: string;
}

export interface AdminClientDetail {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: "CLIENT" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  balanceSim: number;
  totalRequests: number;
  totalSpentSim: number;
  transactions: AdminClientTransaction[];
}

export interface AdminStats {
  totalClients: number;
  totalRequests: number;
  totalRevenueSim: number;
}

export async function getAdminClients(token: string): Promise<AdminClient[]> {
  const res = await fetch(`${API_BASE}/admin/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Mijozlarni yuklab bo'lmadi.");
  return json as AdminClient[];
}

export async function getAdminClient(
  token: string,
  id: string
): Promise<AdminClientDetail> {
  const res = await fetch(`${API_BASE}/admin/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Mijozni yuklab bo'lmadi.");
  return json as AdminClientDetail;
}

export async function creditAdminClient(
  token: string,
  id: string,
  amountSim: number
): Promise<{ balanceSim: number }> {
  const res = await fetch(`${API_BASE}/admin/clients/${id}/credit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amountSim }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Balansni to'ldirib bo'lmadi.");
  return json as { balanceSim: number };
}

export async function suspendAdminClient(
  token: string,
  id: string
): Promise<{ status: "SUSPENDED" }> {
  const res = await fetch(`${API_BASE}/admin/clients/${id}/suspend`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Mijozni bloklab bo'lmadi.");
  return json as { status: "SUSPENDED" };
}

export async function activateAdminClient(
  token: string,
  id: string
): Promise<{ status: "ACTIVE" }> {
  const res = await fetch(`${API_BASE}/admin/clients/${id}/activate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Mijozni faollashtirib bo'lmadi.");
  return json as { status: "ACTIVE" };
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Statistikani yuklab bo'lmadi.");
  return json as AdminStats;
}
