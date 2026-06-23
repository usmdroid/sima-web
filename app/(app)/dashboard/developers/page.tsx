"use client";

import { useState } from "react";

const SIMA_API = "https://tryon-backend-production-92ad.up.railway.app/api";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button
      onClick={copy}
      className="ml-2 shrink-0 rounded border border-slate-600 px-2 py-0.5 text-xs text-slate-300 hover:border-slate-400 hover:text-white transition"
    >
      {copied ? "Nusxalandi!" : "Nusxa olish"}
    </button>
  );
}

function CodeBlock({ code, lang = "js" }: { code: string; lang?: string }) {
  return (
    <div className="relative mt-3 rounded-xl bg-slate-900 text-slate-100 text-sm">
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-1">
        <span className="text-xs text-slate-500 font-mono">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 pb-4 font-mono text-sm leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

const nodeTokenEndpoint = `// server.js (Node / Express)
const express = require("express");
const app = express();

app.post("/sima-token", async (req, res) => {
  const sk = process.env.SIMA_SK; // sk_ ni faqat serverda saqlang
  const apiRes = await fetch("${SIMA_API}/session", {
    method: "POST",
    headers: { "X-Api-Key": sk },
  });
  if (!apiRes.ok) return res.status(502).json({ error: "token xatosi" });
  const { token } = await apiRes.json();
  res.json({ token });
});`;

const phpTokenEndpoint = `<?php
// token.php — do'kon serveridagi endpoint
$sk = getenv("SIMA_SK"); // sk_ ni faqat serverda saqlang
$ch = curl_init("${SIMA_API}/session");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => ["X-Api-Key: $sk"],
]);
$body = json_decode(curl_exec($ch), true);
curl_close($ch);
header("Content-Type: application/json");
echo json_encode(["token" => $body["token"]]);`;

const htmlWidget = `<!-- 1. Widget skriptini head yoki body oxiriga qo'shing -->
<script
  src="https://YOUR-CDN/widget.js"
  data-api-base="${SIMA_API}"
  data-token-url="/sima-token"
></script>

<!-- 2. Mahsulot tugmasiga data-tryon atributlarini qo'shing -->
<button
  data-tryon
  data-cloth="/images/product-1.jpg"
  data-type="upper"
  data-name="Ko'k ko'ylak"
>
  Kiyib ko'rish
</button>`;

const reactWidget = `// app/layout.tsx yoki sahifa komponentida
"use client";
import Script from "next/script";

function configureWidget() {
  window.SimaTryOn?.configure({
    getToken: async () => {
      const res = await fetch("/api/sima-token", { method: "POST" });
      if (!res.ok) throw new Error("token " + res.status);
      return (await res.json()).token;
    },
  });
}

export default function Page() {
  return (
    <>
      <Script
        src="https://YOUR-CDN/widget.js"
        strategy="afterInteractive"
        onReady={configureWidget}
      />
      {/* Mahsulot tugmasi */}
      <button
        onClick={() =>
          window.SimaTryOn?.open({
            cloth: "/images/product.jpg",
            type: "upper",
            name: "Ko'k ko'ylak",
          })
        }
      >
        Kiyib ko'rish
      </button>
    </>
  );
}`;

const nextApiRoute = `// app/api/sima-token/route.ts
const API_BASE = process.env.SIMA_API_BASE || "${SIMA_API}";
const SK = process.env.SIMA_SK || "";

export async function POST() {
  const res = await fetch(\`\${API_BASE}/session\`, {
    method: "POST",
    headers: { "X-Api-Key": SK },
  });
  if (!res.ok) return Response.json({ error: "session " + res.status }, { status: 502 });
  const data = await res.json();
  return Response.json({ token: data.token });
}`;

const wordpressSnippet = `<?php
// functions.php yoki Code Snippets orqali qo'shing
add_action("wp_footer", function () {
  $api_base = "${SIMA_API}";
  echo '<script src="https://YOUR-CDN/widget.js"
    data-api-base="' . $api_base . '"
    data-token-url="/wp-json/sima/v1/token"></script>';
});

// Token endpoint: REST API orqali
add_action("rest_api_init", function () {
  register_rest_route("sima/v1", "/token", [
    "methods" => "POST",
    "callback" => function () {
      $sk = defined("SIMA_SK") ? SIMA_SK : "";
      $res = wp_remote_post("${SIMA_API}/session", [
        "headers" => ["X-Api-Key" => $sk],
      ]);
      $body = json_decode(wp_remote_retrieve_body($res), true);
      return new WP_REST_Response(["token" => $body["token"]]);
    },
    "permission_callback" => "__return_true",
  ]);
});`;

const shopifySnippet = `<!-- theme.liquid ichida </body> oldidan qo'shing -->
<script
  src="https://YOUR-CDN/widget.js"
  data-api-base="${SIMA_API}"
  data-token-url="/apps/sima-proxy/token"
></script>

{%- comment -%}
  Token endpoint: Shopify App Proxy orqali do'kon serveringizda
  POST /apps/sima-proxy/token → X-Api-Key bilan ${SIMA_API}/session chaqirib { token } qaytaradi.
{%- endcomment -%}`;

const flutterSnippet = `// Flutter — Dart
import 'package:http/http.dart' as http;
import 'dart:convert';

// 1. O'z serveringizdan token oling
Future<String> getSimaToken() async {
  final res = await http.post(
    Uri.parse("https://YOUR-SERVER/sima-token"),
  );
  return jsonDecode(res.body)["token"] as String;
}

// 2. /api/tryon ga multipart so'rov yuboring
Future<void> tryOn(String imagePath) async {
  final token = await getSimaToken();
  final request = http.MultipartRequest(
    "POST",
    Uri.parse("${SIMA_API}/tryon"),
  );
  request.headers["Authorization"] = "Bearer \$token";
  request.files.add(await http.MultipartFile.fromPath("person", imagePath));
  request.fields["clothUrl"] = "https://example.com/cloth.jpg";
  request.fields["type"] = "upper";
  final response = await request.send();
  // response.stream — try-on natijasi (rasm bytes)
}`;

const kotlinSnippet = `// Android — Kotlin (OkHttp)
suspend fun getSimaToken(): String {
    val res = OkHttpClient().newCall(
        Request.Builder().url("https://YOUR-SERVER/sima-token").post(RequestBody.create(null, "")).build()
    ).execute()
    return JSONObject(res.body!!.string()).getString("token")
}

suspend fun tryOn(imagePath: String) {
    val token = getSimaToken()
    val body = MultipartBody.Builder().setType(MultipartBody.FORM)
        .addFormDataPart("person", "person.jpg",
            File(imagePath).asRequestBody("image/*".toMediaType()))
        .addFormDataPart("clothUrl", "https://example.com/cloth.jpg")
        .addFormDataPart("type", "upper")
        .build()
    OkHttpClient().newCall(
        Request.Builder()
            .url("${SIMA_API}/tryon")
            .addHeader("Authorization", "Bearer \$token")
            .post(body).build()
    ).execute()
}`;

const swiftSnippet = `// iOS — Swift (URLSession)
func getSimaToken() async throws -> String {
    var req = URLRequest(url: URL(string: "https://YOUR-SERVER/sima-token")!)
    req.httpMethod = "POST"
    let (data, _) = try await URLSession.shared.data(for: req)
    return (try JSONSerialization.jsonObject(with: data) as! [String: Any])["token"] as! String
}

func tryOn(imageData: Data) async throws {
    let token = try await getSimaToken()
    var req = URLRequest(url: URL(string: "${SIMA_API}/tryon")!)
    req.httpMethod = "POST"
    req.setValue("Bearer \\(token)", forHTTPHeaderField: "Authorization")
    let boundary = UUID().uuidString
    req.setValue("multipart/form-data; boundary=\\(boundary)", forHTTPHeaderField: "Content-Type")
    // multipart body: person (image), clothUrl, type maydonlarini qo'shing
    let (_, _) = try await URLSession.shared.data(for: req)
}`;

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Integratsiya qo&apos;llanmasi</h1>
      <p className="mt-3 text-slate-600">
        Sima vidjeti va API-ni saytingizga yoki ilovangizga ulash bo&apos;yicha to&apos;liq yo&apos;riqnoma.
        API bazasi: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono text-indigo-700">{SIMA_API}</code>
      </p>

      {/* ===== Tez boshlash ===== */}
      <Section title="Plagin ulash yo'riqnomasi">
        <ol className="space-y-4 text-slate-700">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
            <div>
              <p className="font-medium">Kabinetda <code className="text-indigo-600">sk_</code> kalit yarating</p>
              <p className="mt-0.5 text-sm text-slate-500">Asosiy → API kalitlar bo&apos;limidan yangi kalit yarating. Faqat bir marta ko&apos;rsatiladi — darhol saqlang.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
            <div>
              <p className="font-medium">Do&apos;kon serveringizda token endpoint yarating</p>
              <p className="mt-0.5 text-sm text-slate-500"><code className="text-indigo-600">sk_</code> ni server muhitida (env) saqlang. Endpoint <code className="text-slate-700">{SIMA_API}/session</code> ga <code className="text-slate-700">X-Api-Key</code> bilan murojaat qilib, <code className="text-slate-700">{"{ token }"}</code> qaytarsin.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</span>
            <div>
              <p className="font-medium">Widget.js skriptini saytingizga qo&apos;shing</p>
              <p className="mt-0.5 text-sm text-slate-500"><code className="text-slate-700">data-api-base</code> va <code className="text-slate-700">data-token-url</code> atributlarini bering.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">4</span>
            <div>
              <p className="font-medium">Mahsulotlarga <code className="text-indigo-600">[data-tryon]</code> tugma qo&apos;shing</p>
              <p className="mt-0.5 text-sm text-slate-500">Yoki JS&apos;dan <code className="text-slate-700">SimaTryOn.open(&#123; cloth, type, name &#125;)</code> chaqiring.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">5</span>
            <div>
              <p className="font-medium">Test qiling</p>
              <p className="mt-0.5 text-sm text-slate-500">Kabinet → Monitoring bo&apos;limida so&apos;rovlar ko&apos;rinishi kerak.</p>
            </div>
          </li>
        </ol>
      </Section>

      {/* ===== Token oqimi ===== */}
      <Section title="Token oqimi (asosiy tushuncha)">
        <p className="text-slate-600 text-sm leading-relaxed">
          Do&apos;kon kabinetda <code className="rounded bg-slate-100 px-1 font-mono text-indigo-700">sk_...</code> (maxfiy API kalit) yaratadi.
          Bu kalit <strong>faqat do&apos;kon serverida</strong> turadi — brauzerga <strong>hech qachon chiqmaydi</strong>.
        </p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 space-y-2">
          <p>1. Do&apos;kon serveri Sima backenddan qisqa muddatli session token oladi:</p>
          <div className="ml-4 space-y-1 font-mono text-xs text-slate-600">
            <p><span className="text-indigo-600">POST</span> {SIMA_API}/session</p>
            <p>Header: <span className="text-amber-700">X-Api-Key: sk_...</span></p>
            <p>Javob: <span className="text-green-700">{"{ \"token\": \"...\" }"}</span> (TTL ~300s)</p>
          </div>
          <p className="mt-2">2. Vidjet shu tokenni ishlatadi: <code className="font-mono">/api/check</code> va <code className="font-mono">/api/tryon</code> so&apos;rovlarida.</p>
        </div>
        <div className="mt-4 text-sm text-slate-600">
          <p>Vidjetni token oqimiga ulash usullari (ustunlik tartibida):</p>
          <ol className="mt-2 ml-4 list-decimal space-y-1">
            <li><code className="font-mono text-slate-800">configure({"{ getToken }"})</code> — JS override (eng yuqori ustuvorlik)</li>
            <li><code className="font-mono text-slate-800">data-token-url</code> — do&apos;kon serveridagi endpoint, <code>{"{ token }"}</code> qaytaradi (PROD tavsiya)</li>
            <li><code className="font-mono text-slate-800">data-token</code> — statik token (faqat DEV/test uchun)</li>
          </ol>
        </div>
      </Section>

      {/* ===== A. HTML/JS ===== */}
      <Section title="A. Oddiy HTML / JavaScript">
        <p className="text-sm text-slate-600">
          Har qanday veb-saytga qo&apos;shish mumkin: WordPress, oddiy HTML yoki boshqa framework.
        </p>
        <SubSection title="Widget skriptini ulash">
          <CodeBlock code={htmlWidget} lang="html" />
        </SubSection>
        <SubSection title="Server token endpoint — Node.js / Express">
          <CodeBlock code={nodeTokenEndpoint} lang="javascript" />
        </SubSection>
        <SubSection title="Server token endpoint — PHP">
          <CodeBlock code={phpTokenEndpoint} lang="php" />
        </SubSection>
      </Section>

      {/* ===== B. React / Next.js ===== */}
      <Section title="B. React / Next.js">
        <p className="text-sm text-slate-600">
          Bu loyihaning o&apos;zidagi <code className="font-mono text-slate-700">app/(marketing)/example/page.tsx</code> va{" "}
          <code className="font-mono text-slate-700">app/api/sima-token/route.ts</code> — real ishlaydigan namuna.
        </p>
        <SubSection title="Sahifaga widget.js ulash (next/script)">
          <CodeBlock code={reactWidget} lang="tsx" />
        </SubSection>
        <SubSection title="Server token endpoint — Next.js App Router (Route Handler)">
          <CodeBlock code={nextApiRoute} lang="ts" />
          <p className="mt-2 text-xs text-slate-500">
            <code className="font-mono">SIMA_SK</code> — <code className="font-mono">.env.local</code> faylida saqlang. Hech qachon clientga eksport qilmang (<code className="font-mono">NEXT_PUBLIC_</code> prefikssiz).
          </p>
        </SubSection>
      </Section>

      {/* ===== C. WordPress ===== */}
      <Section title="C. WordPress / WooCommerce">
        <p className="text-sm text-slate-600">
          Rasmiy plugin hozircha yo&apos;q — tema yoki <strong>Code Snippets</strong> plaginiga quyidagi kodni qo&apos;shing.
        </p>
        <CodeBlock code={wordpressSnippet} lang="php" />
        <p className="mt-2 text-xs text-slate-500 italic">Rasmiy WooCommerce plugin tez orada chiqadi.</p>
      </Section>

      {/* ===== D. Shopify ===== */}
      <Section title="D. Shopify">
        <p className="text-sm text-slate-600">
          Shopify tema fayliga widget skriptini qo&apos;shing, token endpointni Shopify App Proxy orqali xizmat qilsin.
        </p>
        <CodeBlock code={shopifySnippet} lang="liquid" />
        <p className="mt-2 text-xs text-slate-500 italic">Rasmiy Shopify app tez orada chiqadi.</p>
      </Section>

      {/* ===== E. Mobil ===== */}
      <Section title="E. Mobil ilovalar">
        <p className="text-sm text-slate-600">
          Token oqimi bir xil: ilova <strong>o&apos;z backendidan</strong> token oladi, so&apos;ng Sima&apos;ga to&apos;g&apos;ridan-to&apos;g&apos;ri <code className="font-mono">Bearer</code> token bilan multipart so&apos;rov yuboradi.
        </p>
        <SubSection title="Flutter / Dart">
          <CodeBlock code={flutterSnippet} lang="dart" />
        </SubSection>
        <SubSection title="Android — Kotlin (OkHttp)">
          <CodeBlock code={kotlinSnippet} lang="kotlin" />
        </SubSection>
        <SubSection title="iOS — Swift (URLSession)">
          <CodeBlock code={swiftSnippet} lang="swift" />
        </SubSection>
        <p className="mt-4 text-xs text-slate-500 italic">Rasmiy Flutter, Android va iOS SDK tez orada chiqadi.</p>
      </Section>

      {/* ===== Xavfsizlik ===== */}
      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-base font-bold text-amber-900">⚠️ Xavfsizlik eslatmalari</h2>
        <ul className="mt-3 space-y-2 text-sm text-amber-800">
          <li>
            <strong>sk_ kaliti hech qachon brauzerda bo&apos;lmasin</strong> — uni faqat server muhitida (<code className="font-mono">process.env</code> yoki server-side env) saqlang. Brauzer kodiga, git repoga yoki loglarga chiqarmang.
          </li>
          <li>
            <strong>Token qisqa muddatli (~300s)</strong> — har sessiyada server orqali yangi token oling. Tokenni localStorage yoki cookie&apos;da uzoq muddat saqlamang.
          </li>
          <li>
            <strong>Token URL&apos;ingizni CORS bilan himoya qiling</strong> — faqat o&apos;z domeningizdan kelgan so&apos;rovlarga javob bering.
          </li>
        </ul>
      </div>

      <div className="mt-12 pb-6 text-center text-xs text-slate-400">
        Savollar: <a href="mailto:info@sima.uz" className="text-indigo-600 hover:underline">info@sima.uz</a>
      </div>
    </div>
  );
}
