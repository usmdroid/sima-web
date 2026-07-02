import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { BRAND, BRAND_EMAIL, BRAND_TAGLINE } from "@/lib/brand";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const DESCRIPTION =
  "Mijozlaringiz kiyimni o'z rasmida sinab ko'radi. Saytingizga bir qatorda ulang.";

export const metadata: Metadata = {
  metadataBase: new URL("https://trysima.uz"),
  title: {
    template: `%s | ${BRAND} — Virtual try-on`,
    default: `${BRAND} — ${BRAND_TAGLINE}`,
  },
  description: DESCRIPTION,
  keywords: [
    "virtual kiyib ko'rish",
    "onlayn kiyim do'koni",
    "kiyimni sinab ko'rish",
    "virtual try-on",
    "AI try-on",
    "e-commerce widget",
    BRAND,
  ],
  openGraph: {
    title: `${BRAND} — ${BRAND_TAGLINE}`,
    description: DESCRIPTION,
    url: "/",
    siteName: BRAND,
    locale: "uz_UZ",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${BRAND} — ${BRAND_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} — ${BRAND_TAGLINE}`,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    languages: { uz: "/", en: "/", ru: "/", "x-default": "/" },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND,
  url: "https://trysima.uz",
  logo: "https://trysima.uz/sim-icon.png",
  email: BRAND_EMAIL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
