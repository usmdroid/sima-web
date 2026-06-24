"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api";
import { Spinner } from "@/app/components/Spinner";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.client.role === "SUPER_ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard/monitoring");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size={24} className="text-accent" />
    </div>
  );
}
