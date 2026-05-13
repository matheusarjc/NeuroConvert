import Link from "next/link";

type Props = {
  searchParams: { session_id?: string };
};

export default function SucessoPage({ searchParams }: Props) {
  const sid = searchParams.session_id;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center bg-[var(--color-bg-base)] px-6 py-16 text-center text-[var(--color-fg-1)]">
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">Klarivy</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Pagamento recebido</h1>
      <p className="mt-4 text-[var(--color-fg-2)]">
        O Stripe confirmou a sessão. O nosso servidor ativa o plano Pro e os créditos via webhook — em geral leva segundos. Se o
        plano não atualizar, atualize a página ou volte mais tarde; em caso de falha prolongada do webhook, contacte{" "}
        <a href="mailto:team@klarivy.com" className="font-medium text-[var(--color-primary)] underline">
          team@klarivy.com
        </a>{" "}
        com o <span className="font-mono text-[var(--color-fg-1)]">session_id</span> abaixo para reconciliação manual.
      </p>
      {sid ? (
        <p className="mt-6 font-mono text-xs text-[var(--color-fg-3)]">
          session_id: <span className="text-[var(--color-fg-2)]">{sid}</span>
        </p>
      ) : null}
      <Link
        href="/analise"
        className="mt-10 inline-flex justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white outline-none ring-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
      >
        Gerar novo laudo
      </Link>
      <Link
        href="/"
        className="mt-4 text-sm text-[var(--color-primary)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
