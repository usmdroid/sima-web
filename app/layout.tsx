import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { BRAND, BRAND_TAGLINE } from "@/lib/brand";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND} — ${BRAND_TAGLINE}`,
  description:
    "Mijozlaringiz kiyimni o'z rasmida sinab ko'radi. Saytingizga bir qatorda ulang.",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
