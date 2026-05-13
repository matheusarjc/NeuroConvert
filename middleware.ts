import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const STATIC_FILE = /\.(?:ico|png|svg|jpe?g|gif|webp|txt|xml|webmanifest|woff2?)$/i;

function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === "true";
}

/**
 * Com `MAINTENANCE_MODE=true` (ex.: na Vercel), todo o site mostra a página de manutenção,
 * exceto assets `/_next/*`, ficheiros estáticos por extensão, `/maintenance`, e `/api/webhook` (Stripe).
 * APIs restantes respondem 503 JSON.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  if (isMaintenanceMode()) {
    if (pathname.startsWith("/_next") || pathname.startsWith("/maintenance")) {
      return NextResponse.next();
    }
    if (
      pathname === "/favicon.ico" ||
      pathname === "/icon" ||
      pathname === "/apple-icon" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml"
    ) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/webhook")) {
      return NextResponse.next();
    }
    if (pathname === "/api/health") {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "maintenance", message: "Serviço em manutenção. Voltamos em breve." },
        { status: 503 },
      );
    }
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  /** Proteção real de `/admin` entra na VEN-9; por ora só fixa o pipeline do middleware. */
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
