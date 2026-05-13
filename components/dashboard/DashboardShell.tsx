"use client";

import Link from "next/link";

import { KlarivySymbol } from "@/components/brand/KlarivyLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SNAV: { id: string; href: string; tip: string; icon: React.ReactNode }[] = [
  {
    id: "home",
    href: "/dashboard",
    tip: "Dashboard",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    id: "laudos",
    href: "/dashboard/laudos",
    tip: "Laudos",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  {
    id: "new",
    href: "/dashboard/nova",
    tip: "Nova análise",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    ),
  },
  {
    id: "plan",
    href: "/dashboard/plano",
    tip: "Plano",
    icon: (
      <>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </>
    ),
  },
];

function NavIcon({
  item,
  active,
}: {
  item: (typeof SNAV)[number];
  active: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <Link
        href={item.href}
        aria-label={item.tip}
        title={item.tip}
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] border outline-none ring-[var(--color-primary)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] ${
          active
            ? "border-[color:rgba(29,158,117,0.2)] bg-[rgba(29,158,117,0.12)]"
            : hov
              ? "border-transparent bg-[rgba(255,255,255,0.05)]"
              : "border-transparent bg-transparent"
        }`}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke={active ? "#1D9E75" : hov ? "#9CA3AF" : "#6B7280"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {item.icon}
        </svg>
      </Link>
      {hov ? (
        <div
          className="pointer-events-none absolute left-[52px] top-1/2 z-[200] -translate-y-1/2 whitespace-nowrap rounded-md border border-[#2A2A2A] bg-[#1C1C1C] px-2.5 py-1 text-xs text-white shadow-lg"
          role="tooltip"
        >
          {item.tip}
        </div>
      ) : null}
    </div>
  );
}

const SCREEN_LABEL: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/laudos": "Laudos",
  "/dashboard/nova": "Nova análise",
  "/dashboard/plano": "Plano & cobrança",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = SCREEN_LABEL[pathname] ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)] font-sans text-[var(--color-fg-1)]">
      <aside className="z-10 flex w-[60px] shrink-0 flex-col items-center border-r border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] py-4">
        <div className="mb-5 flex w-full justify-center border-b border-[rgba(255,255,255,0.06)] pb-4">
          <Link href="/" aria-label="klarivy — início" className="outline-none ring-[var(--color-primary)] focus-visible:ring-2">
            <KlarivySymbol size={28} />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1.5" aria-label="Dashboard">
          {SNAV.map((item) => {
            const active =
              pathname === item.href || (item.id === "laudos" && pathname.startsWith("/dashboard/laudos"));
            return <NavIcon key={item.id} item={item} active={active} />;
          })}
        </nav>
        <div className="mt-3 flex w-full flex-col items-center gap-1.5 border-t border-[rgba(255,255,255,0.05)] pt-3">
          <span
            className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-[10px] opacity-50"
            title="Em breve"
            aria-disabled
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </span>
          <div className="mt-2 flex h-8 w-8 cursor-default items-center justify-center rounded-full border-[1.5px] border-[color:rgba(29,158,117,0.3)] bg-[rgba(29,158,117,0.15)]">
            <span className="font-display text-[13px] font-bold text-[var(--color-primary)]">R</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-surface)] px-5">
          <div className="flex min-w-[140px] items-center gap-1.5">
            <span className="font-display text-[15px] font-semibold text-white">{title}</span>
          </div>
          <div className="relative hidden max-w-[380px] flex-1 items-center gap-2 md:flex">
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Buscar laudos, páginas…"
              disabled
              aria-label="Busca em breve"
              className="h-[34px] w-full min-w-0 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] py-0 pl-8 pr-[4.5rem] text-[13px] text-[var(--color-fg-2)] outline-none placeholder:text-[#6B7280] disabled:cursor-not-allowed disabled:opacity-70"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-fg-3)]">
              Em breve
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/analise"
              className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white outline-none ring-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-surface)]"
            >
              Nova análise
            </Link>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
