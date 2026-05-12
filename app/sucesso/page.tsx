import Link from "next/link";

type Props = {
  searchParams: { session_id?: string };
};

export default function SucessoPage({ searchParams }: Props) {
  const sid = searchParams.session_id;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16 text-center text-[#F8FAFC]">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#1D9E75]">NeuroConvert</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Pagamento recebido</h1>
      <p className="mt-4 text-[#94A3B8]">
        O Stripe confirmou a sessão. O webhook activa o plano Pro e os créditos — em segundos podes voltar a gerar laudos.
      </p>
      {sid ? (
        <p className="mt-6 font-mono text-xs text-[#64748B]">
          session_id: <span className="text-[#CBD5E1]">{sid}</span>
        </p>
      ) : null}
      <Link
        href="/analise"
        className="mt-10 inline-flex justify-center rounded-lg bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white hover:bg-[#178f69]"
      >
        Gerar novo laudo
      </Link>
      <Link href="/" className="mt-4 text-sm text-[#1D9E75] hover:underline">
        Voltar ao início
      </Link>
    </main>
  );
}
