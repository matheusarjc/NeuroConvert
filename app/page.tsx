export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-[#1D9E75]">
        NeuroConvert
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
        Base Next.js pronta
      </h1>
      <p className="mt-4 text-[#94A3B8]">
        Stack alinhada ao guia de deploy: App Router, Tailwind, dependências de
        API (Claude, Firecrawl, Stripe, Supabase, Resend). Próximo passo:{" "}
        <span className="text-[#F8FAFC]">VEN-2</span> — scraping e análise com
        IA.
      </p>
    </main>
  );
}
