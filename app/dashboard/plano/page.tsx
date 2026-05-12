import Link from "next/link";

export default function DashboardPlanoPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8">
        <h1 className="font-display text-xl font-bold text-[var(--color-fg-1)]">Plano & cobrança</h1>
        <p className="mt-2 text-sm text-[var(--color-fg-2)]">
          Upgrade e gestão de subscrição via Stripe. O checkout Pro está disponível a partir do paywall na análise.
        </p>
        <Link
          href="/analise"
          className="mt-6 inline-flex rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg-1)] hover:border-[var(--color-border-strong)]"
        >
          Abrir fluxo de análise
        </Link>
      </div>
    </div>
  );
}
