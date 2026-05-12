import { NextResponse } from "next/server";

/**
 * Crons na Vercel: define `CRON_SECRET` no projecto; a plataforma envia
 * `Authorization: Bearer <CRON_SECRET>`. Em dev/local podes usar só `ADMIN_SECRET`.
 */
export function requireCronAuth(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET ?? process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "CRON_SECRET ou ADMIN_SECRET em falta" },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return null;
}
