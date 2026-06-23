"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "@/lib/api";

export default function AuthNavButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(getSession() !== null);
  }, []);

  if (loggedIn) {
    return (
      <Link
        href="/dashboard"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
    >
      Kirish
    </Link>
  );
}
