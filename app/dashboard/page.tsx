import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="p-6 text-[var(--color-fg-2)] lg:p-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">Resumo</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--color-fg-1)]">Painel</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed">
          Dados abaixo são demonstração alinhada ao kit de UI; em seguida ligamos a Supabase e ao histórico de laudos reais.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { v: "63", l: "Score médio (demo)", c: "var(--color-warning)" },
            { v: "12", l: "Laudos este mês", c: "var(--color-fg-1)" },
            { v: "R$ 24k", l: "Impacto estimado", c: "var(--color-good)" },
          ].map((x) => (
            <div key={x.l} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
              <div className="font-display text-3xl font-bold tracking-tight" style={{ color: x.c }}>
                {x.v}
              </div>
              <div className="mt-1 text-xs text-[var(--color-fg-2)]">{x.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 lg:col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-3)]">Evolução do score</div>
            <p className="mt-1 text-xs text-[var(--color-fg-2)]">Placeholder — gráfico completo no ui_kits/dashboard.</p>
            <div className="mt-6 flex h-36 items-end justify-between gap-1 rounded-lg bg-[var(--color-bg-elevated)] px-4 pb-2 pt-4">
              {[40, 52, 48, 58, 55, 61, 63].map((h, i) => (
                <div
                  key={i}
                  className="w-full max-w-[32px] rounded-t bg-[var(--color-primary)]/80"
                  style={{ height: `${h}%` }}
                  title={`Ponto ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-3)]">Ação rápida</div>
            <p className="mt-2 text-sm leading-relaxed">Gera um laudo real com a API já ligada em produção.</p>
            <Link
              href="/dashboard/nova"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-light)]"
            >
              Ir para Nova análise
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
