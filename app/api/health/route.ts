import { NextResponse } from "next/server";

/** Health check leve para smoke tests (dependências checadas em fases posteriores). */
export async function GET() {
  return NextResponse.json({ ok: true, service: "neuroconvert" });
}
