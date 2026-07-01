"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/api";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export function useVariant(experimentKey: string): "A" | "B" {
  const [variant, setVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    const storageKey = `sima_ab_${experimentKey}`;
    const stored = localStorage.getItem(storageKey);
    if (stored === "A" || stored === "B") {
      setVariant(stored);
      return;
    }
    const session = getSession();
    const userId = session?.client.id ?? "anon";
    const computed: "A" | "B" = hashString(`${experimentKey}:${userId}`) % 2 === 0 ? "A" : "B";
    localStorage.setItem(storageKey, computed);
    setVariant(computed);
  }, [experimentKey]);

  return variant;
}
