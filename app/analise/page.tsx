import { Suspense } from "react";

import { AnalyzeClient } from "@/components/analyze/AnalyzeClient";

export default function AnalisePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--color-bg-base)] px-6 py-12 text-[var(--color-fg-2)]">A carregar…</main>}>
      <AnalyzeClient showBackLink />
    </Suspense>
  );
}
