import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Proteção real de `/admin` entra na VEN-9; por ora só fixa o pipeline do middleware. */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
