import type { Metadata } from "next";

import { KlarivyLockup } from "@/components/brand/KlarivyLogo";

export const metadata: Metadata = {
  title: "Em breve | Klarivy",
  description: "Estamos a preparar a nova experiência. Voltamos em breve.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-base)] px-6 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />
      <div className="relative z-[1] max-w-lg">
        <div className="mx-auto mb-8 flex justify-center">
          <KlarivyLockup boxClassName="h-9 w-[min(90vw,220px)]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Manutenção</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-[var(--color-fg-1)] md:text-5xl">
          Voltamos em breve
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-fg-2)]">
          Estamos a melhorar a experiência e a preparar novidades. O site volta ao ar dentro em instantes — obrigado pela
          paciência.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm text-[var(--color-fg-2)]">
            <span
              className="relative flex h-2 w-2"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            </span>
            <span className="font-medium text-[var(--color-fg-1)]">Klarivy</span>
            <span className="text-[var(--color-fg-3)]">· em atualização</span>
          </div>
          <p className="text-xs text-[var(--color-fg-3)]">
            Dúvidas urgentes: <span className="text-[var(--color-fg-2)]">team@klarivy.com</span>
          </p>
        </div>
      </div>
    </main>
  );
}
