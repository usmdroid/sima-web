import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Env-driven origins; safe defaults for local dev.
const ADMIN_ORIGIN = process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? "https://admin.trysima.uz";
const USER_ORIGIN = process.env.NEXT_PUBLIC_USER_ORIGIN ?? "https://trysima.uz";

interface SessionPayload {
  token: string;
  client: { role: string };
}

function parseSession(raw: string | undefined): SessionPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as SessionPayload;
  } catch {
    return null;
  }
}

// Production host detection — guards cross-origin redirects so localhost/preview is not broken.
function isProdHost(host: string): boolean {
  return host === "trysima.uz" || host.endsWith(".trysima.uz");
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;
  const isAdminHost = host.startsWith("admin.");
  const session = parseSession(request.cookies.get("sima_session")?.value);

  if (isAdminHost) {
    // Always allow the login page through — prevents infinite rewrite loop.
    if (pathname === "/login" || pathname.startsWith("/login/")) {
      return NextResponse.next();
    }

    if (!session) {
      // No session: show login page (rewrite within same subdomain).
      return NextResponse.rewrite(new URL("/login", request.url));
    }

    if (session.client.role !== "SUPER_ADMIN") {
      // Logged-in non-admin: send them to the user site (prod only).
      if (isProdHost(host)) {
        return NextResponse.redirect(`${USER_ORIGIN}/dashboard`);
      }
      return NextResponse.rewrite(new URL("/login", request.url));
    }

    // SUPER_ADMIN on admin host: rewrite root to /admin, leave everything else untouched.
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // User host: redirect SUPER_ADMIN away from authenticated areas (prod only).
  if (session?.client.role === "SUPER_ADMIN" && isProdHost(host)) {
    const isAuthArea =
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/") ||
      pathname === "/admin" ||
      pathname.startsWith("/admin/");
    if (isAuthArea) {
      return NextResponse.redirect(ADMIN_ORIGIN);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
