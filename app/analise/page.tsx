"use client";

import Link from "next/link";
import { useId, useState } from "react";

type ReportShape = {
  score: number;
  score_label?: string;
  headline?: string;
  sections?: { title: string; finding: string; severity?: string }[];
  quick_wins?: { rank: number; action: string; impact?: string }[];
};

export default function AnalisePage() {
  const formId = useId();
  const [url, setUrl] = useState("https://vercel.com");
  const [sector, setSector] = useState("SaaS B2B");
  const [userId, setUserId] = useState("");
  const [bearer, setBearer] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportShape | null>(null);
  const [errorBody, setErrorBody] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);

  const [emailCheckout, setEmailCheckout] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function submitAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorBody(null);
    setReport(null);
    setHttpStatus(null);
    setCheckoutUrl(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const t = bearer.trim();
      if (t) headers.Authorization = `Bearer ${t}`;
      const uid = userId.trim();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({
          url: url.trim(),
          sector: sector.trim(),
          ...(uid ? { userId: uid } : {}),
        }),
      });
      setHttpStatus(res.status);
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        if (res.status === 402) {
          setErrorBody(null);
          return;
        }
        setErrorBody(JSON.stringify(data, null, 2));
        return;
      }
      setReport((data.report as ReportShape) ?? null);
    } catch (err) {
      setErrorBody(err instanceof Error ? err.message : "Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  async function submitCheckout(e: React.FormEvent) {
    e.preventDefault();
    const uid = userId.trim();
    if (!uid) {
      setErrorBody(JSON.stringify({ error: "validation_error", message: "userId obrigatório para checkout" }));
      return;
    }
    setCheckoutLoading(true);
    setCheckoutUrl(null);
    setErrorBody(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "pro",
          email: emailCheckout.trim(),
          userId: uid,
        }),
      });
      setHttpStatus(res.status);
      const data = (await res.json()) as { url?: string; error?: string; message?: string };
      if (!res.ok) {
        setErrorBody(JSON.stringify(data, null, 2));
        return;
      }
      if (data.url) setCheckoutUrl(data.url);
    } catch (err) {
      setErrorBody(err instanceof Error ? err.message : "Erro de rede");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const noCredits = httpStatus === 402;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12 text-[#F8FAFC]">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-[#1D9E75] hover:underline">
          ← Início
        </Link>
      </nav>

      <p className="text-xs font-semibold uppercase tracking-widest text-[#1D9E75]">Fluxo gratuito</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Gerar laudo</h1>
      <p className="mt-3 text-[#94A3B8]">
        Utilizador <strong className="text-[#E2E8F0]">free</strong> tem 1 crédito por ciclo. Em produção envia o{" "}
        <strong className="text-[#E2E8F0]">access token</strong> do Supabase Auth; em dev podes usar{" "}
        <code className="rounded bg-[#1E293B] px-1">ANALYZE_ALLOW_BODY_USER_ID=true</code> e o UUID no campo abaixo.
      </p>

      <form id={formId} onSubmit={submitAnalyze} className="mt-8 space-y-5">
        <div>
          <label htmlFor={`${formId}-url`} className="block text-sm font-medium text-[#CBD5E1]">
            URL da página
          </label>
          <input
            id={`${formId}-url`}
            name="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-base text-[#F8FAFC] outline-none ring-[#1D9E75] focus:ring-2"
            autoComplete="url"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-sector`} className="block text-sm font-medium text-[#CBD5E1]">
            Setor
          </label>
          <input
            id={`${formId}-sector`}
            name="sector"
            type="text"
            required
            maxLength={120}
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-base outline-none ring-[#1D9E75] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-user`} className="block text-sm font-medium text-[#CBD5E1]">
            ID do utilizador (UUID)
          </label>
          <input
            id={`${formId}-user`}
            name="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 font-mono text-sm outline-none ring-[#1D9E75] focus:ring-2"
            placeholder="opcional se usares só JWT"
            inputMode="text"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-jwt`} className="block text-sm font-medium text-[#CBD5E1]">
            Access token Supabase (opcional)
          </label>
          <textarea
            id={`${formId}-jwt`}
            name="bearer"
            rows={2}
            value={bearer}
            onChange={(e) => setBearer(e.target.value)}
            className="mt-1 w-full resize-y rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 font-mono text-xs outline-none ring-[#1D9E75] focus:ring-2"
            placeholder="eyJhbGciOiJIUzI1NiIs..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#178f69] disabled:opacity-60"
        >
          {loading ? "A analisar…" : "Gerar laudo"}
        </button>
      </form>

      <div className="mt-8" aria-live="polite">
        {noCredits && (
          <section className="rounded-xl border border-[#BA7517]/40 bg-[#422006]/30 p-5" aria-labelledby={`${formId}-paywall`}>
            <h2 id={`${formId}-paywall`} className="text-lg font-semibold text-[#FBBF24]">
              Sem créditos — paywall
            </h2>
            <p className="mt-2 text-sm text-[#CBD5E1]">
              O plano free só permite uma análise por ciclo. Para continuar, abre o checkout Pro (email tem de coincidir com o
              registo na base de dados).
            </p>
            <form onSubmit={submitCheckout} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor={`${formId}-email`} className="block text-sm text-[#CBD5E1]">
                  Email do utilizador
                </label>
                <input
                  id={`${formId}-email`}
                  type="email"
                  required
                  value={emailCheckout}
                  onChange={(e) => setEmailCheckout(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm outline-none ring-[#1D9E75] focus:ring-2"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={checkoutLoading}
                className="rounded-lg bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white hover:bg-[#178f69] disabled:opacity-60"
              >
                {checkoutLoading ? "…" : "Subscrever Pro"}
              </button>
            </form>
          </section>
        )}

        {checkoutUrl && (
          <p className="mt-4 text-sm">
            <a href={checkoutUrl} className="font-semibold text-[#1D9E75] underline">
              Abrir Stripe Checkout
            </a>
          </p>
        )}

        {errorBody && !report && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-[#1E293B] p-4 text-xs text-[#FCA5A5]">{errorBody}</pre>
        )}

        {report && (
          <article className="mt-6 rounded-xl border border-[#334155] bg-[#0F172A] p-6">
            <p className="text-sm text-[#94A3B8]">Score</p>
            <p className="font-display text-4xl font-bold text-[#1D9E75]">{report.score}</p>
            {report.score_label && <p className="text-sm text-[#CBD5E1]">{report.score_label}</p>}
            {report.headline && <p className="mt-4 text-lg text-[#E2E8F0]">{report.headline}</p>}
            {report.sections && report.sections.length > 0 && (
              <ul className="mt-6 space-y-4">
                {report.sections.map((s) => (
                  <li key={s.title} className="border-l-2 border-[#1D9E75] pl-4">
                    <h3 className="font-medium text-[#F8FAFC]">{s.title}</h3>
                    <p className="mt-1 text-sm text-[#94A3B8]">{s.finding}</p>
                  </li>
                ))}
              </ul>
            )}
            {report.quick_wins && report.quick_wins.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">Quick wins</h3>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-[#CBD5E1]">
                  {report.quick_wins.map((q) => (
                    <li key={q.rank}>
                      {q.action}
                      {q.impact ? <span className="text-[#1D9E75]"> — {q.impact}</span> : null}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
