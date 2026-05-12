import Link from "next/link";

export default function DashboardLaudosPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center">
        <h1 className="font-display text-xl font-bold text-[var(--color-fg-1)]">Laudos</h1>
        <p className="mt-2 text-sm text-[var(--color-fg-2)]">
          Lista de laudos com filtros virá da base de dados. Por agora, usa a{" "}
          <Link href="/dashboard/nova" className="text-[var(--color-primary)] underline">
            Nova análise
          </Link>{" "}
          para gerar um laudo.
        </p>
      </div>
    </div>
  );
}
