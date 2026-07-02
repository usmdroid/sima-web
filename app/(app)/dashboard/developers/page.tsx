"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const SIMA_API = "https://api.trysima.uz/api";

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
      className="ml-2 shrink-0 rounded border border-[#4a4a4a] px-2 py-0.5 text-xs text-[#ccc] hover:border-[#888] hover:text-white transition"
    >
      {copied ? "Nusxalandi!" : "Nusxa olish"}
    </button>
  );
}

function CodeBlock({ code, lang = "js" }: { code: string; lang?: string }) {
  return (
    <div className="relative mt-3 rounded-xl bg-primary text-[#e8e0d4] text-sm">
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-1">
        <span className="text-xs text-muted font-mono">{lang}</span>
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
      <h2 className="text-xl font-bold text-primary font-serif">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-primary">{title}</h3>
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

const pythonTokenEndpoint = `# app.py — Flask (Django/FastAPI ham shu mantiq)
import os, requests
from flask import Flask, jsonify

app = Flask(__name__)

@app.post("/sima-token")
def sima_token():
    sk = os.environ["SIMA_SK"]  # sk_ ni faqat serverda saqlang
    r = requests.post("${SIMA_API}/session", headers={"X-Api-Key": sk})
    if not r.ok:
        return jsonify(error="token xatosi"), 502
    return jsonify(token=r.json()["token"])`;

const javaTokenEndpoint = `// TokenController.java — Spring Boot
@RestController
public class TokenController {
  private final String sk = System.getenv("SIMA_SK"); // sk_ faqat serverda

  @PostMapping("/sima-token")
  public ResponseEntity<?> token() throws Exception {
    var req = HttpRequest.newBuilder()
        .uri(URI.create("${SIMA_API}/session"))
        .header("X-Api-Key", sk)
        .POST(HttpRequest.BodyPublishers.noBody())
        .build();
    var res = HttpClient.newHttpClient()
        .send(req, HttpResponse.BodyHandlers.ofString());
    if (res.statusCode() != 200)
      return ResponseEntity.status(502).body(Map.of("error", "token xatosi"));
    // Jackson: { "token": "..." } ni o'qib qaytaring
    return ResponseEntity.ok(new ObjectMapper().readTree(res.body()));
  }
}`;

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

const flutterSdkSnippet = `// pubspec.yaml
//   dependencies:
//     sima_tryon: ^0.1.0
//     http: ^1.2.0

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:sima_tryon/sima_tryon.dart';

class ProductPage extends StatelessWidget {
  const ProductPage({super.key});

  // 1. Token o'z serveringizdan olinadi — sk_ hech qachon ilovada bo'lmaydi.
  Future<String> _getToken() async {
    final res = await http.post(Uri.parse("https://YOUR-SERVER/sima-token"));
    return jsonDecode(res.body)["token"] as String;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          // 2. Tugma bosilganda tayyor ekran ochiladi — rasm tanlash,
          //    /check va /tryon hammasi SDK ichida.
          onPressed: () => SimaTryOn.open(
            context,
            config: SimaConfig(getToken: _getToken),
            product: const SimaProduct(
              clothUrl: "https://example.com/cloth.jpg", // yoki SimaProduct.bytes(...)
              clothType: "upper", // ixtiyoriy: upper | lower | overall
              name: "Ko'k ko'ylak", // ixtiyoriy
            ),
          ),
          child: const Text("Kiyib ko'rish"),
        ),
      ),
    );
  }
}`;

const flutterSnippet = `// Flutter — Dart (SDKsiz, to'g'ridan HTTP)
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
  const t = useTranslations("developers");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary font-serif">{t("title")}</h1>
      <p className="mt-3 text-muted">
        {t("subtitle")}
        {" "}{t("apiBase")} <code className="rounded bg-beige px-1.5 py-0.5 text-sm font-mono text-accent">{SIMA_API}</code>
      </p>

      <Section title={t("quickStart")}>
        <ol className="space-y-4 text-muted">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">1</span>
            <div>
              <p className="font-medium text-primary">Kabinetda <code className="text-accent">sk_</code> kalit yarating</p>
              <p className="mt-0.5 text-sm text-muted">Asosiy → API kalitlar bo&apos;limidan yangi kalit yarating. Faqat bir marta ko&apos;rsatiladi — darhol saqlang.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">2</span>
            <div>
              <p className="font-medium text-primary">Do&apos;kon serveringizda token endpoint yarating</p>
              <p className="mt-0.5 text-sm text-muted"><code className="text-accent">sk_</code> ni server muhitida (env) saqlang. Endpoint <code className="text-primary">{SIMA_API}/session</code> ga <code className="text-primary">X-Api-Key</code> bilan murojaat qilib, <code className="text-primary">{"{ token }"}</code> qaytarsin.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">3</span>
            <div>
              <p className="font-medium text-primary">Widget.js skriptini saytingizga qo&apos;shing</p>
              <p className="mt-0.5 text-sm text-muted"><code className="text-primary">data-api-base</code> va <code className="text-primary">data-token-url</code> atributlarini bering.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">4</span>
            <div>
              <p className="font-medium text-primary">Mahsulotlarga <code className="text-accent">[data-tryon]</code> tugma qo&apos;shing</p>
              <p className="mt-0.5 text-sm text-muted">Yoki JS&apos;dan <code className="text-primary">SimaTryOn.open(&#123; cloth, type, name &#125;)</code> chaqiring.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">5</span>
            <div>
              <p className="font-medium text-primary">Test qiling</p>
              <p className="mt-0.5 text-sm text-muted">Kabinet → Monitoring bo&apos;limida so&apos;rovlar ko&apos;rinishi kerak.</p>
            </div>
          </li>
        </ol>
      </Section>

      {/* ===== Token oqimi ===== */}
      <Section title={t("tokenFlow")}>
        <p className="text-muted text-sm leading-relaxed">
          Do&apos;kon kabinetda <code className="rounded bg-beige px-1 font-mono text-accent">sk_...</code> (maxfiy API kalit) yaratadi.
          Bu kalit <strong className="text-primary">faqat do&apos;kon serverida</strong> turadi — brauzerga <strong className="text-primary">hech qachon chiqmaydi</strong>.
        </p>
        <div className="mt-4 rounded-2xl border border-line bg-beige p-5 text-sm text-primary space-y-2">
          <p>1. Do&apos;kon serveri Sima backenddan qisqa muddatli session token oladi:</p>
          <div className="ml-4 space-y-1 font-mono text-xs text-muted">
            <p><span className="text-accent">POST</span> {SIMA_API}/session</p>
            <p>Header: <span className="text-[#8B6914]">X-Api-Key: sk_...</span></p>
            <p>Javob: <span className="text-green-700">{"{ \"token\": \"...\" }"}</span> (TTL ~300s)</p>
          </div>
          <p className="mt-2">2. Vidjet shu tokenni ishlatadi: <code className="font-mono">/api/check</code> va <code className="font-mono">/api/tryon</code> so&apos;rovlarida.</p>
        </div>
        <div className="mt-4 text-sm text-muted">
          <p>Vidjetni token oqimiga ulash usullari (ustunlik tartibida):</p>
          <ol className="mt-2 ml-4 list-decimal space-y-1">
            <li><code className="font-mono text-primary">configure({"{ getToken }"})</code> — JS override (eng yuqori ustuvorlik)</li>
            <li><code className="font-mono text-primary">data-token-url</code> — do&apos;kon serveridagi endpoint, <code>{"{ token }"}</code> qaytaradi (PROD tavsiya)</li>
            <li><code className="font-mono text-primary">data-token</code> — statik token (faqat DEV/test uchun)</li>
          </ol>
        </div>
      </Section>

      {/* ===== A. HTML/JS ===== */}
      <Section title={t("htmlJs")}>
        <p className="text-sm text-muted">
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
        <SubSection title="Server token endpoint — Python (Flask)">
          <CodeBlock code={pythonTokenEndpoint} lang="python" />
        </SubSection>
        <SubSection title="Server token endpoint — Java (Spring Boot)">
          <CodeBlock code={javaTokenEndpoint} lang="java" />
        </SubSection>
      </Section>

      {/* ===== B. React / Next.js ===== */}
      <Section title={t("react")}>
        <p className="text-sm text-muted">
          Bu loyihaning o&apos;zidagi <code className="font-mono text-primary">app/(marketing)/example/page.tsx</code> va{" "}
          <code className="font-mono text-primary">app/api/sima-token/route.ts</code> — real ishlaydigan namuna.
        </p>
        <SubSection title="Sahifaga widget.js ulash (next/script)">
          <CodeBlock code={reactWidget} lang="tsx" />
        </SubSection>
        <SubSection title="Server token endpoint — Next.js App Router (Route Handler)">
          <CodeBlock code={nextApiRoute} lang="ts" />
          <p className="mt-2 text-xs text-muted">
            <code className="font-mono">SIMA_SK</code> — <code className="font-mono">.env.local</code> faylida saqlang. Hech qachon clientga eksport qilmang (<code className="font-mono">NEXT_PUBLIC_</code> prefikssiz).
          </p>
        </SubSection>
      </Section>

      {/* ===== C. WordPress ===== */}
      <Section title={t("wordpress")}>
        <p className="text-sm text-muted">
          Rasmiy plugin hozircha yo&apos;q — tema yoki <strong className="text-primary">Code Snippets</strong> plaginiga quyidagi kodni qo&apos;shing.
        </p>
        <CodeBlock code={wordpressSnippet} lang="php" />
        <p className="mt-2 text-xs text-muted italic">Rasmiy WooCommerce plugin tez orada chiqadi.</p>
      </Section>

      {/* ===== D. Shopify ===== */}
      <Section title={t("shopify")}>
        <p className="text-sm text-muted">
          Shopify tema fayliga widget skriptini qo&apos;shing, token endpointni Shopify App Proxy orqali xizmat qilsin.
        </p>
        <CodeBlock code={shopifySnippet} lang="liquid" />
        <p className="mt-2 text-xs text-muted italic">Rasmiy Shopify app tez orada chiqadi.</p>
      </Section>

      {/* ===== E. Mobil ===== */}
      <Section title={t("mobile")}>
        <p className="text-sm text-muted">
          Token oqimi bir xil: ilova <strong className="text-primary">o&apos;z backendidan</strong> token oladi, so&apos;ng Sima&apos;ga to&apos;g&apos;ridan-to&apos;g&apos;ri <code className="font-mono">Bearer</code> token bilan multipart so&apos;rov yuboradi.
        </p>
        <SubSection title="Flutter — sima_tryon SDK (tavsiya)">
          <CodeBlock code={flutterSdkSnippet} lang="dart" />
          <p className="mt-2 text-xs text-muted">
            Rasmiy paket tayyor UI, rasm tanlash va <code className="font-mono">/check</code> + <code className="font-mono">/tryon</code> oqimini o&apos;zi boshqaradi.
          </p>
        </SubSection>
        <SubSection title="Flutter — SDKsiz (to'g'ridan HTTP)">
          <CodeBlock code={flutterSnippet} lang="dart" />
        </SubSection>
        <SubSection title="Android — Kotlin (OkHttp)">
          <CodeBlock code={kotlinSnippet} lang="kotlin" />
        </SubSection>
        <SubSection title="iOS — Swift (URLSession)">
          <CodeBlock code={swiftSnippet} lang="swift" />
        </SubSection>
        <p className="mt-4 text-xs text-muted italic">Rasmiy Flutter, Android va iOS SDK tez orada chiqadi.</p>
      </Section>

      {/* ===== Xavfsizlik ===== */}
      <div className="mt-10 rounded-2xl border border-line bg-beige p-6">
        <h2 className="text-base font-bold text-primary">{t("security")}</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <strong className="text-primary">sk_ kaliti hech qachon brauzerda bo&apos;lmasin</strong> — uni faqat server muhitida (<code className="font-mono">process.env</code> yoki server-side env) saqlang. Brauzer kodiga, git repoga yoki loglarga chiqarmang.
          </li>
          <li>
            <strong className="text-primary">Token qisqa muddatli (~300s)</strong> — har sessiyada server orqali yangi token oling. Tokenni localStorage yoki cookie&apos;da uzoq muddat saqlamang.
          </li>
          <li>
            <strong className="text-primary">Token URL&apos;ingizni CORS bilan himoya qiling</strong> — faqat o&apos;z domeningizdan kelgan so&apos;rovlarga javob bering.
          </li>
        </ul>
      </div>

      <div className="mt-12 pb-6 text-center text-xs text-muted">
        {t("questions")} <a href="mailto:info@sima.uz" className="text-accent hover:text-hover transition-colors">info@sima.uz</a>
      </div>
    </div>
  );
}
