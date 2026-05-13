"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getBrowserSupabase } from "@/lib/supabase/browser";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="6" height="24" rx="3" fill="#1D9E75" />
      <polygon points="10,6 16,6 22,30 16,30" fill="#1D9E75" />
      <rect x="16" y="6" width="6" height="24" rx="3" fill="#1D9E75" />
      <circle cx="28" cy="9" r="3" fill="#25C98F" />
      <circle cx="28" cy="9" r="5.5" fill="none" stroke="#25C98F" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function ScoreRing({ score, color, size = 160, stroke = 12 }: { score: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [cur, setCur] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setCur(score);
      return;
    }
    const t = setTimeout(() => setCur(score), 300);
    return () => clearTimeout(t);
  }, [score, reducedMotion]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ - (cur / 100) * circ}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: reducedMotion ? "none" : "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)",
          filter: reducedMotion ? undefined : `drop-shadow(0 0 6px ${color}55)`,
        }}
      />
    </svg>
  );
}

function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-primary)]">{children}</div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [heroUrl, setHeroUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function goAnalyze() {
    const u = heroUrl.trim();
    const dest = u ? `/analise?url=${encodeURIComponent(u)}` : "/analise";
    const supabase = getBrowserSupabase();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push(dest);
        return;
      }
    }
    router.push(`/conta/criar?redirect=${encodeURIComponent(dest)}`);
  }

  const DEMO_SCORE = 54;
  const DEMO_COLOR = "#F59E0B";
  const SECTOR_SCORE = 61;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-fg-1)]">
      <nav
        className={`fixed left-0 right-0 top-0 z-[100] flex h-16 items-center justify-between px-6 transition-all duration-300 md:px-10 ${
          scrolled
            ? "border-b border-[var(--color-border)] bg-[color:rgba(10,10,10,0.92)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
        aria-label="Principal"
      >
        <Link
          href="/"
          title="Klarivy — laudos com metodologia NeuroConvert"
          className="flex shrink-0 items-center gap-2 outline-none ring-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
        >
          <LogoMark />
          <span className="font-display text-lg font-bold tracking-tight">
            Klar<span className="text-[var(--color-primary)]">ivy</span>
          </span>
        </Link>
        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <a href="#metodologia" className="text-sm font-medium text-[var(--color-fg-2)] transition-colors hover:text-[var(--color-fg-1)]">
            Metodologia
          </a>
          <a href="#como-funciona" className="text-sm font-medium text-[var(--color-fg-2)] transition-colors hover:text-[var(--color-fg-1)]">
            Como funciona
          </a>
          <a href="#precos" className="text-sm font-medium text-[var(--color-fg-2)] transition-colors hover:text-[var(--color-fg-1)]">
            Preços
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none md:gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-fg-1)] outline-none ring-[var(--color-primary)] md:hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-panel"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-[var(--color-fg-2)] hover:text-[var(--color-fg-1)] sm:inline"
            aria-label="Abrir painel (demonstração, sem login)"
            title="Painel em construção — acesso sem login por enquanto"
          >
            Painel<span className="ml-1 text-[10px] font-normal text-[var(--color-fg-3)]">(demo)</span>
          </Link>
          <button
            type="button"
            onClick={goAnalyze}
            className="h-9 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white outline-none ring-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-light)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
          >
            Gerar laudo
          </button>
        </div>
        <div
          id="nav-mobile-panel"
          className={`absolute left-0 right-0 top-16 z-[99] border-b border-[var(--color-border)] bg-[color:rgba(10,10,10,0.98)] px-6 py-4 backdrop-blur-md md:hidden ${menuOpen ? "block" : "hidden"}`}
        >
          <div className="flex flex-col gap-3">
            <a
              href="#metodologia"
              className="text-sm font-medium text-[var(--color-fg-2)] py-2"
              onClick={() => setMenuOpen(false)}
            >
              Metodologia
            </a>
            <a
              href="#como-funciona"
              className="text-sm font-medium text-[var(--color-fg-2)] py-2"
              onClick={() => setMenuOpen(false)}
            >
              Como funciona
            </a>
            <a href="#precos" className="text-sm font-medium text-[var(--color-fg-2)] py-2" onClick={() => setMenuOpen(false)}>
              Preços
            </a>
            <Link
              href="/dashboard"
              className="border-t border-[var(--color-border)] pt-3 text-sm font-medium text-[var(--color-primary)]"
              onClick={() => setMenuOpen(false)}
            >
              Painel (demo)
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-24 md:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-[1] flex w-full max-w-[1100px] flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-[72px]">
          <div className="flex w-full flex-1 flex-col gap-5">
            <p className="max-w-[520px] text-xs leading-relaxed text-[var(--color-fg-2)]">
              <span className="font-semibold text-[var(--color-fg-1)]">Para quem é:</span> founders e equipas de growth de produtos
              digitais (SaaS, e-commerce, educação) que querem um laudo estruturado antes de investir em redesign ou tráfego pago.
            </p>

            <h1 className="max-w-[540px] font-display text-4xl font-bold leading-[1.08] tracking-tight text-[var(--color-fg-1)] md:text-[50px]">
              Você está perdendo receita em cada visita que não converte
            </h1>
            <p className="max-w-[460px] text-base leading-relaxed text-[var(--color-fg-2)]">
              A <strong className="font-medium text-[var(--color-fg-1)]">Klarivy</strong> identifica bloqueios neuropsicológicos na sua
              página e devolve um laudo com score 0–100, benchmark do setor e ações priorizadas — com base na metodologia{" "}
              <strong className="font-medium text-[var(--color-fg-1)]">NeuroConvert</strong>.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <label htmlFor="hero-url" className="sr-only">
                URL da página
              </label>
              <input
                id="hero-url"
                type="url"
                placeholder="https://suapagina.com.br"
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                className="h-12 w-full flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 text-sm text-[var(--color-fg-1)] outline-none ring-[var(--color-primary)] placeholder:text-[var(--color-fg-3)] focus:border-[color:rgba(29,158,117,0.5)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
              />
              <button
                type="button"
                onClick={goAnalyze}
                className="h-12 shrink-0 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-6 text-sm font-semibold text-white outline-none ring-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
              >
                Gerar laudo →
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-fg-3)]">
              Conta gratuita obrigatória · 1 laudo incluído no free · Sem cartão no plano gratuito · Laudo em poucos minutos (depende
              da página e da fila)
            </p>

            <div className="mt-1 flex flex-wrap gap-2">
              {["Cialdini · Persuasão", "Kahneman · Comportamental", "Nielsen Norman · UX"].map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2.5 py-1"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[var(--color-fg-3)]" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                  </svg>
                  <span className="text-[10px] text-[var(--color-fg-3)]">{b}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-6 border-t border-[var(--color-border)] pt-4">
              {[
                ["Score 0–100", "com rótulo qualitativo"],
                ["Benchmark", "por setor no laudo"],
                ["Quick wins", "ordenados por impacto esperado"],
              ].map(([t, d]) => (
                <div key={t} className="min-w-[120px]">
                  <div className="font-display text-[15px] font-bold leading-snug tracking-tight text-[var(--color-fg-1)]">{t}</div>
                  <div className="mt-1 text-[11px] text-[var(--color-fg-3)]">{d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full max-w-[340px] shrink-0 flex-col gap-2.5 lg:w-[340px]">
            <p className="text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-3)] lg:text-left">
              Ilustração · valores fictícios
            </p>
            <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3.5">
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.07em] text-[var(--color-fg-3)]">Benchmark do setor</div>
                <div className="text-xs text-[var(--color-fg-2)]">E-commerce BR · média</div>
              </div>
              <div className="flex items-center gap-2.5">
                <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    className="text-[var(--color-fg-3)]"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - SECTOR_SCORE / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                  />
                </svg>
                <span className="font-mono text-[26px] font-bold tracking-tight text-[var(--color-fg-2)]">{SECTOR_SCORE}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.07em] text-[var(--color-fg-3)]">Sua landing page</div>
                  <div className="font-mono text-[10px] text-[var(--color-fg-3)]">NC-00847 · exemplo</div>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-[color:rgba(239,68,68,0.25)] bg-[var(--color-critical-muted)] px-2 py-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <polyline points="18,15 12,9 6,15" />
                  </svg>
                  <span className="font-mono text-[10px] font-bold text-[var(--color-critical)]">-7 vs. setor</span>
                </div>
              </div>
              <div className="relative mb-4 flex justify-center">
                <ScoreRing score={DEMO_SCORE} color={DEMO_COLOR} size={140} stroke={11} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="font-display text-[52px] font-bold leading-none tracking-tight" style={{ color: DEMO_COLOR }}>
                    {DEMO_SCORE}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: DEMO_COLOR }}>
                    Atenção
                  </div>
                </div>
              </div>
              {[
                ["Prova social ausente", "cr", "+11% CR"],
                ["Garantia mal posicionada", "cr", "+7% CR"],
                ["Urgência insuficiente", "wa", "+4% CR"],
              ].map(([t, sev, imp]) => (
                <div key={t} className="flex items-center justify-between border-b border-[var(--color-border)] py-1.5 last:border-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-[5px] w-[5px] shrink-0 rounded-full"
                      style={{ background: sev === "cr" ? "#EF4444" : "#F59E0B" }}
                    />
                    <span className="text-[11px] text-[var(--color-fg-2)]">{t}</span>
                  </div>
                  <span
                    className="font-mono text-[10px] font-bold"
                    style={{ color: sev === "cr" ? "#EF4444" : "#F59E0B" }}
                  >
                    {imp}
                  </span>
                </div>
              ))}
              <div className="mt-3 rounded-lg border border-[color:rgba(239,68,68,0.15)] bg-[color:rgba(239,68,68,0.06)] px-3 py-2.5">
                <span className="text-[11px] text-[var(--color-critical)]">
                  Receita estimada em risco:{" "}
                  <span className="font-mono font-bold">R$ 8.200/mês</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-[1100px] px-6 py-20 md:px-10">
        <div className="mb-16 text-center">
          <SecLabel>Como funciona</SecLabel>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight text-[var(--color-fg-1)] md:text-4xl">
            Diagnóstico completo em 3 etapas
          </h2>
          <p className="mx-auto max-w-[440px] text-base text-[var(--color-fg-2)]">
            Da URL ao laudo com score, benchmark e ações priorizadas — em geral, poucos minutos após enviar o pedido.
          </p>
        </div>
        <div className="flex flex-col divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] md:flex-row md:divide-x md:divide-y-0">
          {[
            {
              n: "01",
              title: "Cole a URL",
              desc: "Qualquer landing page, checkout ou página de produto. Funciona com todas as plataformas.",
              icon: (
                <>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </>
              ),
            },
            {
              n: "02",
              title: "Análise neuropsicológica",
              desc: "Dezenas de sinais de atenção, confiança, urgência, clareza e fricção cognitiva, cruzados com o texto real da página.",
              icon: (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </>
              ),
            },
            {
              n: "03",
              title: "Laudo com score e ações",
              desc: "Score 0–100, benchmark do setor, problemas por severidade e quick wins ordenados por impacto.",
              icon: (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                </>
              ),
            },
          ].map((s, i) => (
            <div key={s.n} className="flex flex-1 flex-col gap-3.5 py-8 first:pt-0 last:pb-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:rgba(29,158,117,0.2)] bg-[var(--color-primary-muted)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    {s.icon}
                  </svg>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--color-primary)]">{s.n}</span>
              </div>
              <h3 className="font-display text-lg font-semibold leading-snug text-[var(--color-fg-1)]">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-fg-2)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metodologia */}
      <section id="metodologia" className="border-y border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SecLabel>Metodologia científica</SecLabel>
            <h2 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-[var(--color-fg-1)]">
              Framework inspirado em literatura de CRO e decisão humana
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-[var(--color-fg-2)]">
              Nossa engine de análise combina princípios de neuroeconomia, psicologia da persuasão e UX research para identificar os
              exatos pontos de fricção cognitiva que inibem a conversão.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                ["Psicologia da Persuasão", "Cialdini 1984 · 6 princípios de influência", "#1D9E75"],
                ["Neuroeconomia Comportamental", "Kahneman & Tversky · Teoria da Perspectiva", "#38BDF8"],
                ["UX Research & Cognitive Load", "Nielsen Norman Group · Sweller 1988", "#9CA3AF"],
                ["Attention & Memory", "Von Restorff 1933 · Efeito de isolamento", "#9CA3AF"],
              ].map(([t, sub, c]) => (
                <div key={t} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3.5 py-2.5">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c }} />
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-fg-1)]">{t}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-[var(--color-fg-3)]">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: "0–100", label: "score no laudo", color: "var(--color-primary)" },
              { val: "5", label: "eixos no relatório", color: "var(--color-fg-1)" },
              { val: "3+", label: "quick wins sugeridos", color: "var(--color-good)" },
              { val: "1", label: "laudo free por conta", color: "var(--color-fg-1)" },
            ].map((m) => (
              <div key={m.val} className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
                <div className="mb-1.5 font-display text-[30px] font-bold leading-none tracking-tight" style={{ color: m.color }}>
                  {m.val}
                </div>
                <div className="text-xs text-[var(--color-fg-2)]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços — números alinhados ao produto real (context.md) */}
      <section id="precos" className="mx-auto max-w-[1100px] px-6 py-24 md:px-10">
        <div className="mb-14 text-center">
          <SecLabel>Preços</SecLabel>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-fg-1)] md:text-4xl">Planos para cada estágio</h2>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {[
            {
              name: "Free",
              price: "R$ 0",
              period: "/mês",
              desc: "Para validar o laudo na sua própria página",
              features: [
                "1 laudo incluído por conta (sem créditos mensais automáticos)",
                "Score 0–100 e benchmark no texto",
                "Achados por severidade e quick wins",
              ],
              cta: "Criar conta",
              primary: false,
            },
            {
              name: "Pro",
              price: "R$ 297",
              period: "/mês",
              desc: "Para equipas que geram laudos todos os meses",
              features: [
                "10 laudos por ciclo de faturação (renovados a cada fatura paga)",
                "7 dias de teste no Stripe antes da primeira cobrança",
                "Laudo completo com categorias e referências por achado",
                "Histórico na mesma conta",
              ],
              cta: "Começar no Pro",
              primary: true,
            },
            {
              name: "Agency",
              price: "Sob consulta",
              period: "",
              desc: "Operações em escala",
              features: ["Volume sob medida", "API e integrações", "White-label", "SLA e account manager"],
              cta: "Falar com vendas",
              primary: false,
            },
          ].map((pl) => (
            <div
              key={pl.name}
              className={`relative flex flex-1 flex-col gap-4 rounded-[14px] border p-7 ${
                pl.primary
                  ? "border-[color:rgba(29,158,117,0.35)] bg-[linear-gradient(150deg,#111e16,#141414)] shadow-[0_0_40px_rgba(29,158,117,0.12)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-surface)]"
              }`}
            >
              {pl.primary ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--color-primary)] px-3.5 py-1 text-[11px] font-semibold text-white">
                  7 dias de teste
                </div>
              ) : null}
              <div>
                <div className="font-display text-[15px] font-semibold text-[var(--color-fg-1)]">{pl.name}</div>
                <div className="mt-1 text-xs text-[var(--color-fg-2)]">{pl.desc}</div>
              </div>
              <div className="flex items-end gap-0.5">
                <span className="font-display text-[32px] font-bold leading-none tracking-tight text-[var(--color-fg-1)]">{pl.price}</span>
                <span className="mb-1 text-[13px] text-[var(--color-fg-2)]">{pl.period}</span>
              </div>
              <div className="h-px bg-[var(--color-border)]" />
              <ul className="flex flex-1 flex-col gap-2">
                {pl.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    <span className="text-[13px] text-[var(--color-fg-2)]">{f}</span>
                  </li>
                ))}
              </ul>
              {pl.primary ? (
                <Link
                  href="/analise"
                  className="flex h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-center text-[13px] font-semibold text-white transition hover:bg-[var(--color-primary-light)]"
                >
                  {pl.cta}
                </Link>
              ) : pl.name === "Agency" ? (
                <a
                  href="mailto:team@klarivy.com"
                  className="flex h-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-fg-2)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg-1)]"
                >
                  {pl.cta}
                </a>
              ) : (
                <Link
                  href={`/conta/criar?redirect=${encodeURIComponent("/analise")}`}
                  className="flex h-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-fg-2)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg-1)]"
                >
                  {pl.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-[13px] leading-relaxed text-[var(--color-fg-2)]">
            <strong className="text-[var(--color-fg-1)]">Monitorização automática mensal</strong> (re-análise agendada e e-mail
            comparativo) está em <strong className="text-[var(--color-fg-1)]">roadmap</strong> — não faz parte do produto hoje. Os 10
            laudos Pro são gerados manualmente na app até lá. Dúvidas ou prioridades:{" "}
            <a href="mailto:team@klarivy.com" className="font-semibold text-[var(--color-primary)] underline">
              team@klarivy.com
            </a>
            .
          </p>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-[1100px] flex-wrap justify-between gap-10">
          <div className="max-w-[220px]">
            <div className="mb-3 flex items-center gap-2">
              <LogoMark className="h-5 w-5" />
              <span className="font-display text-sm font-bold text-[var(--color-fg-1)]">
                Klar<span className="text-[var(--color-primary)]">ivy</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--color-fg-3)]">
              Laudos de conversão com base na metodologia NeuroConvert.
            </p>
          </div>
          {[
            { title: "Produto", links: ["Como funciona", "Preços", "Dashboard"] as const },
            { title: "Empresa", links: ["Sobre", "Blog", "Contato"] as const },
            { title: "Legal", links: ["Privacidade", "Termos"] as const },
          ].map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-fg-3)]">{col.title}</div>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l}>
                    {l === "Como funciona" ? (
                      <a href="#como-funciona" className="text-[13px] text-[var(--color-fg-2)] hover:text-[var(--color-fg-1)]">
                        {l}
                      </a>
                    ) : l === "Preços" ? (
                      <a href="#precos" className="text-[13px] text-[var(--color-fg-2)] hover:text-[var(--color-fg-1)]">
                        {l}
                      </a>
                    ) : l === "Dashboard" ? (
                      <Link href="/dashboard" className="text-[13px] text-[var(--color-fg-2)] hover:text-[var(--color-fg-1)]">
                        {l}
                      </Link>
                    ) : (
                      <span className="cursor-default text-[13px] text-[var(--color-fg-3)]" title="Em breve">
                        {l}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 flex max-w-[1100px] justify-between border-t border-[var(--color-border)] pt-6">
          <span className="text-[11px] text-[var(--color-fg-3)]">© 2026 Klarivy · metodologia NeuroConvert</span>
          <span className="font-mono text-[10px] text-[var(--color-fg-3)]">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
