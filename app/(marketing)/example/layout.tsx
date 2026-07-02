import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Namuna — Sima vidjeti",
  description:
    "Sima vidjetining do'kon saytida qanday ko'rinishini namoyish etuvchi sahifa.",
};

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
