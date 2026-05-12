import { Suspense } from "react";

import { AnalyzeClient } from "@/components/analyze/AnalyzeClient";

export default function DashboardNovaPage() {
  return (
    <div className="bg-[var(--color-bg-base)] px-4 py-6">
      <Suspense
        fallback={<div className="mx-auto max-w-2xl py-8 text-sm text-[var(--color-fg-2)]">A carregar…</div>}
      >
        <AnalyzeClient showBackLink={false} />
      </Suspense>
    </div>
  );
}
