import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-[#1D9E75]">
        NeuroConvert
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-[#F8FAFC]">
        Laudo de neuromarketing em minutos
      </h1>
      <p className="mt-4 text-[#94A3B8]">
        Cola a URL da landing, escolhe o setor e recebe score, dimensões e quick wins. Plano free: uma análise por ciclo;
        depois, upgrade Pro via Stripe Checkout.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/analise"
          className="inline-flex rounded-lg bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-white hover:bg-[#178f69]"
        >
          Começar análise
        </Link>
        <Link href="/api/health" className="inline-flex items-center rounded-lg border border-[#334155] px-5 py-3 text-sm text-[#CBD5E1] hover:border-[#1D9E75]">
          Health JSON
        </Link>
      </div>
    </main>
  );
}
