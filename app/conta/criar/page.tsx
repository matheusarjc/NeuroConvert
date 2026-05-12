"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useState } from "react";

import { getBrowserSupabase } from "@/lib/supabase/browser";

function CriarContaForm() {
  const formId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect")?.trim() || "/analise";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMsg("Supabase não configurado no browser (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY).");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : undefined },
      });
      if (error) {
        setMsg(error.message);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[var(--color-bg-base)] px-6 py-16 text-[var(--color-fg-1)]">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">NeuroConvert</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Criar conta</h1>
      <p className="mt-2 text-sm text-[var(--color-fg-2)]">Use a mesma conta para gerar laudos e gerir o plano.</p>

      <form id={formId} onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-[var(--color-fg-2)]">
            E-mail
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-fg-1)] outline-none ring-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-pw`} className="block text-sm font-medium text-[var(--color-fg-2)]">
            Senha
          </label>
          <input
            id={`${formId}-pw`}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-fg-1)] outline-none ring-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
          />
          <p className="mt-1 text-xs text-[var(--color-fg-3)]">Mínimo de 8 caracteres.</p>
        </div>
        {msg ? (
          <p className="text-sm text-[var(--color-critical-light)]" role="alert">
            {msg}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white outline-none ring-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] disabled:opacity-60"
        >
          {loading ? "A criar…" : "Criar conta gratuita"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-fg-2)]">
        Já tem conta?{" "}
        <Link href={`/conta/entrar?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-[var(--color-primary)] hover:underline">
          Entrar
        </Link>
      </p>
      <Link href="/" className="mt-4 text-center text-sm text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)]">
        ← Voltar ao início
      </Link>
    </main>
  );
}

export default function CriarContaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-base)] px-6 py-16 text-[var(--color-fg-2)]">A carregar…</div>}>
      <CriarContaForm />
    </Suspense>
  );
}
