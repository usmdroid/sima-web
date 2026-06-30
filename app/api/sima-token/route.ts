// Demo "do'kon serveri": sk_ ni SERVER tarafda ushlaydi va Sima backendidan
// qisqa muddatli session token zarb qiladi. sk_ brauzerga HECH QACHON chiqmaydi.
// Bu — vidjet token oqimining haqiqiy (server bilan) sinovi.

const API_BASE = (
  process.env.SIMA_API_BASE || "https://api.trysima.uz/api"
).replace(/\/+$/, "");

// Demo uchun sotuvchi siri. Production'da SIMA_DEMO_SK env bilan bering.
const SK = process.env.SIMA_DEMO_SK || "test-key-12345";

export async function POST() {
  try {
    const res = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "X-Api-Key": SK },
    });
    if (!res.ok) {
      return Response.json({ error: `session ${res.status}` }, { status: 502 });
    }
    const data = (await res.json()) as { token?: string };
    if (!data.token) return Response.json({ error: "token yo'q" }, { status: 502 });
    return Response.json({ token: data.token });
  } catch {
    return Response.json({ error: "Sima backendiga ulanib bo'lmadi" }, { status: 502 });
  }
}
