"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { getBrowserSupabase } from "@/lib/supabase/browser";

export type ReportShape = {
  score: number;
  score_label?: string;
  headline?: string;
  sections?: { title: string; finding: string; severity?: string }[];
  quick_wins?: { rank: number; action: string; impact?: string }[];
};

type AnalyzeClientProps = {
  /** Quando false, omite o link “← Início” (ex.: dentro do dashboard). */
  showBackLink?: boolean;
};

export function AnalyzeClient({ showBackLink = true }: AnalyzeClientProps) {
  const formId = useId();
  const searchParams = useSearchParams();
  const supabase = getBrowserSupabase();

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [url, setUrl] = useState("");
  const [sector, setSector] = useState("SaaS B2B");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportShape | null>(null);
  const [errorBody, setErrorBody] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);

  const [emailCheckout, setEmailCheckout] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const redirectAfterAuth = (() => {
    const q = searchParams.toString();
    return q ? `/analise?${q}` : "/analise";
  })();

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setAuthReady(true);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    setAuthReady(true);
  }, [supabase]);

  useEffect(() => {
    void refreshSession();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, [supabase, refreshSession]);

  useEffect(() => {
    const q = searchParams.get("url");
    if (q?.trim()) setUrl(q.trim());
  }, [searchParams]);

  useEffect(() => {
    if (session?.user?.email) setEmailCheckout(session.user.email);
  }, [session]);

  async function submitAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const { data: sessWrap } = await supabase.auth.getSession();
    const tok = sessWrap.session?.access_token;
    if (!tok) {
      setErrorBody(JSON.stringify({ error: "unauthorized", message: "Sessão expirada — entre novamente." }));
      return;
    }

    setLoading(true);
    setErrorBody(null);
    setReport(null);
    setHttpStatus(null);
    setCheckoutUrl(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          sector: sector.trim(),
          ...(additionalContext.trim() ? { ctx: additionalContext.trim() } : {}),
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
    if (!supabase) return;
    const { data: sessWrap } = await supabase.auth.getSession();
    const uid = sessWrap.session?.user?.id;
    if (!uid) {
      setErrorBody(JSON.stringify({ error: "validation_error", message: "É preciso estar autenticado para o checkout." }));
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

  if (!authReady) {
    return (
      <main className="mx-auto min-h-0 max-w-2xl px-6 py-12 text-[var(--color-fg-2)]">
        {showBackLink ? (
          <nav className="mb-8 text-sm">
            <Link href="/" className="text-[var(--color-primary)] hover:underline">
              ← Início
            </Link>
          </nav>
        ) : null}
        A carregar…
      </main>
    );
  }

  if (!supabase) {
    return (
      <main className="mx-auto min-h-0 max-w-2xl px-6 py-8 text-[var(--color-fg-1)]">
        {showBackLink ? (
          <nav className="mb-8 text-sm">
            <Link href="/" className="text-[var(--color-primary)] hover:underline">
              ← Início
            </Link>
          </nav>
        ) : null}
        <h1 className="font-display text-2xl font-bold">Configuração em falta</h1>
        <p className="mt-3 text-sm text-[var(--color-fg-2)]">
          Defina <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no ambiente para permitir login e análises.
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto min-h-0 max-w-2xl px-6 py-8 text-[var(--color-fg-1)]">
        {showBackLink ? (
          <nav className="mb-8 text-sm">
            <Link href="/" className="text-[var(--color-primary)] hover:underline">
              ← Início
            </Link>
          </nav>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">Análise</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Crie uma conta para analisar</h1>
        <p className="mt-3 text-[var(--color-fg-2)]">
          O laudo gratuito fica ligado à sua conta (créditos, histórico e upgrade). Não pedimos token técnico — a sessão trata da
          autenticação em segurança.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/conta/criar?redirect=${encodeURIComponent(redirectAfterAuth)}`}
            className="inline-flex justify-center rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-light)]"
          >
            Criar conta gratuita
          </Link>
          <Link
            href={`/conta/entrar?redirect=${encodeURIComponent(redirectAfterAuth)}`}
            className="inline-flex justify-center rounded-lg border border-[var(--color-border-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-fg-1)] hover:border-[var(--color-primary)]"
          >
            Já tenho conta
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-0 max-w-2xl px-6 py-8 text-[var(--color-fg-1)]">
      {showBackLink ? (
        <nav className="mb-8 flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="text-[var(--color-primary)] hover:underline">
            ← Início
          </Link>
          <button
            type="button"
            className="text-[var(--color-fg-2)] hover:text-[var(--color-fg-1)]"
            onClick={() => void supabase.auth.signOut().then(() => refreshSession())}
          >
            Sair
          </button>
        </nav>
      ) : (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            className="text-sm text-[var(--color-fg-2)] hover:text-[var(--color-fg-1)]"
            onClick={() => void supabase.auth.signOut().then(() => refreshSession())}
          >
            Sair
          </button>
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">Análise</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Gerar laudo</h1>
      <p className="mt-3 text-[var(--color-fg-2)]">
        Plano <strong className="text-[var(--color-fg-1)]">free</strong>: 1 análise por ciclo de faturação. Os créditos são
        aplicados automaticamente à sua conta.
      </p>

      <form id={formId} onSubmit={submitAnalyze} className="mt-8 space-y-5">
        <div>
          <label htmlFor={`${formId}-url`} className="block text-sm font-medium text-[var(--color-fg-2)]">
            URL da página
          </label>
          <input
            id={`${formId}-url`}
            name="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-base text-[var(--color-fg-1)] outline-none ring-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
            autoComplete="url"
            placeholder="https://…"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-sector`} className="block text-sm font-medium text-[var(--color-fg-2)]">
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
            className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-base outline-none ring-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-ctx`} className="block text-sm font-medium text-[var(--color-fg-2)]">
            Contexto adicional <span className="font-normal text-[var(--color-fg-3)]">(opcional)</span>
          </label>
          <p id={`${formId}-ctx-hint`} className="mt-1 text-xs text-[var(--color-fg-3)]">
            Público-alvo, objeção principal, promessa da oferta ou o que a IA deve priorizar na leitura da página.
          </p>
          <textarea
            id={`${formId}-ctx`}
            name="additionalContext"
            rows={4}
            maxLength={2000}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            aria-describedby={`${formId}-ctx-hint`}
            className="mt-2 w-full resize-y rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-fg-1)] outline-none ring-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
            placeholder="Ex.: B2B SaaS, decisor é CMO, queremos focar na prova social e no formulário acima da dobra…"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white outline-none ring-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] disabled:opacity-60"
        >
          {loading ? "A analisar…" : "Gerar laudo"}
        </button>
      </form>

      <div className="mt-8" aria-live="polite">
        {noCredits && (
          <section
            className="rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning-muted)] p-5"
            aria-labelledby={`${formId}-paywall`}
          >
            <h2 id={`${formId}-paywall`} className="text-lg font-semibold text-[var(--color-warning-light)]">
              Limite do plano free
            </h2>
            <p className="mt-2 text-sm text-[var(--color-fg-2)]">
              Você já usou a análise gratuita deste período. Para continuar gerando laudos, assine o Pro — use o mesmo e-mail da
              sua conta.
            </p>
            <form onSubmit={submitCheckout} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor={`${formId}-email`} className="block text-sm text-[var(--color-fg-2)]">
                  E-mail da conta
                </label>
                <input
                  id={`${formId}-email`}
                  type="email"
                  required
                  value={emailCheckout}
                  onChange={(e) => setEmailCheckout(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={checkoutLoading}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white outline-none ring-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] disabled:opacity-60"
              >
                {checkoutLoading ? "…" : "Subscrever Pro"}
              </button>
            </form>
          </section>
        )}

        {checkoutUrl && (
          <p className="mt-4 text-sm">
            <a href={checkoutUrl} className="font-semibold text-[var(--color-primary)] underline">
              Abrir Stripe Checkout
            </a>
          </p>
        )}

        {errorBody && !report && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-[var(--color-bg-surface)] p-4 text-xs text-[var(--color-critical-light)]">
            {errorBody}
          </pre>
        )}

        {report && (
          <article className="mt-6 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-6">
            <p className="text-sm text-[var(--color-fg-2)]">Score</p>
            <p className="font-display text-4xl font-bold text-[var(--color-primary)]">{report.score}</p>
            {report.score_label && <p className="text-sm text-[var(--color-fg-2)]">{report.score_label}</p>}
            {report.headline && <p className="mt-4 text-lg text-[var(--color-fg-1)]">{report.headline}</p>}
            {report.sections && report.sections.length > 0 && (
              <ul className="mt-6 space-y-4">
                {report.sections.map((s) => (
                  <li key={s.title} className="border-l-2 border-[var(--color-primary)] pl-4">
                    <h3 className="font-medium text-[var(--color-fg-1)]">{s.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-fg-2)]">{s.finding}</p>
                  </li>
                ))}
              </ul>
            )}
            {report.quick_wins && report.quick_wins.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-2)]">Quick wins</h3>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-[var(--color-fg-2)]">
                  {report.quick_wins.map((q) => (
                    <li key={q.rank}>
                      {q.action}
                      {q.impact ? <span className="text-[var(--color-primary)]"> — {q.impact}</span> : null}
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
