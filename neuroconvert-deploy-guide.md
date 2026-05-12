# NeuroConvert — Guia de Deploy Completo

> Stack: Next.js 14 + Firecrawl + Claude API + Stripe + Supabase + Vercel
> Tempo estimado: 6–10 horas para ter tudo no ar, incluindo observabilidade e dashboard admin

---

## Índice

1. [Setup do projeto](#1-setup-do-projeto)
2. [Scraping e análise com IA](#2-scraping-e-análise-com-ia)
3. [Stripe — pagamentos e assinaturas](#3-stripe--pagamentos-e-assinaturas)
4. [Banco de dados — Supabase](#4-banco-de-dados--supabase)
5. [Deploy na Vercel](#5-deploy-na-vercel)
6. [Contas e serviços necessários](#6-contas-e-serviços-necessários)
7. [Fluxo completo do usuário](#7-fluxo-completo-do-usuário)
8. [Sistema de Mensageria](#8-sistema-de-mensageria)
9. [Dashboard Admin — saúde e operações](#9-dashboard-admin--saúde-e-operações)
10. [Métricas Financeiras e Curvas Microeconômicas](#10-métricas-financeiras-e-curvas-microeconômicas)
11. [Alertas de Upgrade de Ferramentas](#11-alertas-de-upgrade-de-ferramentas)
12. [Primeiros passos — hoje](#12-primeiros-passos--hoje)

---

## 1. Setup do projeto

```bash
npx create-next-app@latest neuroconvert --typescript --tailwind --app
cd neuroconvert
npm install @anthropic-ai/sdk stripe @mendable/firecrawl-js resend @supabase/supabase-js
```

### Variáveis de ambiente — `.env.local`

```env
# Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Firecrawl (scraping de URLs)
FIRECRAWL_API_KEY=fc-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
# STRIPE_PRICE_AGENCY — opcional; checkout self-serve só Pro (Agência sob consulta)

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM=noreply@neuroconvert.com.br

# Eventos operacionais: `lib/monitoring.ts` → `logEvent()` (tabela `system_events`)

# Admin dashboard
ADMIN_SECRET=uma-senha-forte-aqui
ADMIN_EMAIL=seu@email.com

# App
NEXT_PUBLIC_URL=https://neuroconvert.com.br
```

---

## 2. Scraping e análise com IA

### `app/api/analyze/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import FirecrawlApp from '@mendable/firecrawl-js';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { logEvent } from '@/lib/monitoring';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NEURO_PROMPT = (url: string, sector: string, content: string, ctx: string) => `
Você é especialista em neuromarketing com 15 anos de experiência em conversão digital.

URL: ${url} | Setor: ${sector}
Contexto: ${ctx || 'Não fornecido'}

CONTEÚDO REAL DA PÁGINA:
${content.slice(0, 6000)}

REGRAS: Use o conteúdo real. Cite princípios: Lei de Hick, Von Restorff, FOMO,
Ancoragem, Prova Social, Enquadramento, Fluência Cognitiva, Gestalt, Código Reptiliano.

Retorne APENAS JSON:
{
  "score": <0-100>, "score_label": "<Fraco|Regular|Bom|Excelente>",
  "benchmark": "<benchmark do setor>", "headline": "<achado principal>",
  "sections": [
    { "title": "Primeira Impressão (0-3s)", "icon": "eye",
      "severity": "<critical|warning|good>", "finding": "...", "science": "..." },
    { "title": "Gatilhos de Persuasão", "icon": "brain",
      "severity": "...", "finding": "...", "science": "..." },
    { "title": "Psicologia de Cores", "icon": "palette",
      "severity": "...", "finding": "...", "science": "..." },
    { "title": "CTAs e Decisão", "icon": "pointer",
      "severity": "...", "finding": "...", "science": "..." },
    { "title": "Carga Cognitiva", "icon": "cpu",
      "severity": "...", "finding": "...", "science": "..." }
  ],
  "quick_wins": [
    { "rank": 1, "action": "...", "science": "...", "impact": "<+X%>" },
    { "rank": 2, "action": "...", "science": "...", "impact": "..." },
    { "rank": 3, "action": "...", "science": "...", "impact": "..." }
  ]
}`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const { url, sector, ctx, userId } = await req.json();

  // Checar créditos do usuário
  const { data: user } = await supabase
    .from('users').select('*').eq('id', userId).single();

  if (!user || user.credits_remaining < 1) {
    return NextResponse.json({ error: 'no_credits' }, { status: 402 });
  }

  // Scraping com Firecrawl
  let pageContent = '';
  let scrapingOk = true;
  try {
    const scraped = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });
    if (scraped && 'success' in scraped && scraped.success === true) {
      pageContent = scraped.markdown || '';
    } else {
      scrapingOk = false;
      pageContent = 'Conteúdo indisponível. Analise pela URL e setor.';
    }
  } catch {
    scrapingOk = false;
    pageContent = 'Conteúdo indisponível. Analise pela URL e setor.';
  }

  // Análise com Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: NEURO_PROMPT(url, sector, pageContent, ctx) }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const report = JSON.parse(text.replace(/```json\n?|```/g, '').trim());
  const latencyMs = Date.now() - startTime;

  // Salvar laudo e decrementar crédito atomicamente
  await Promise.all([
    supabase.from('reports').insert({
      user_id: userId, url, sector,
      score: report.score, report_json: report,
      scraping_ok: scrapingOk, latency_ms: latencyMs
    }),
    supabase.from('users').update({
      credits_remaining: user.credits_remaining - 1
    }).eq('id', userId)
  ]);

  // Registrar evento de observabilidade
  await logEvent('analysis_completed', {
    userId, url, sector, score: report.score,
    latencyMs, scrapingOk, creditsAfter: user.credits_remaining - 1
  });

  // Email automático quando usuário esgota análise gratuita
  if (user.plan === 'free' && user.credits_remaining === 1) {
    await sendEmail({
      to: user.email,
      template: 'free_limit_reached',
      data: { score: report.score, url }
    });
  }

  return NextResponse.json({ report });
}
```

---

## 3. Stripe — pagamentos e assinaturas

### Criar produtos no Stripe Dashboard

```
Produto (self-serve na app): NeuroConvert Pro
  Preço: R$ 297,00 / mês | BRL | Recorrente | Trial: 7 dias
  → Copiar o "API ID" do preço (ex.: price_1AbCdEf...) para STRIPE_PRICE_PRO no .env.local

Plano Agência (sob consulta)
  Não usa Checkout desta API. Negociação comercial; podes activar utilizadores com plano
  `agency` na BD (ou criar subscrição manual no Stripe com metadata plan=agency + userId,
  para o webhook continuar a funcionar).
```

### `app/api/checkout/route.ts`

```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { plan, email, userId } = await req.json();
  if (plan !== 'pro') {
    return Response.json({ error: 'agency_on_request' }, { status: 422 });
  }
  const priceId = process.env.STRIPE_PRICE_PRO!;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    locale: 'pt-BR',
    success_url: `${process.env.NEXT_PUBLIC_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}?canceled=true`,
    metadata: { plan, userId },
    subscription_data: {
      trial_period_days: 7,
      metadata: { plan, userId }
    }
  });

  return Response.json({ url: session.url });
}
```

### `app/api/webhook/route.ts`

```typescript
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { logEvent } from '@/lib/monitoring';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Webhook error', { status: 400 });
  }

  switch (event.type) {

    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const plan = sub.metadata.plan;
      const credits = plan === 'agency' ? 9999 : 10;

      await supabase.from('users').update({
        plan, credits_remaining: credits,
        subscription_status: sub.status,
        stripe_subscription_id: sub.id,
        subscribed_at: new Date().toISOString()
      }).eq('stripe_customer_id', sub.customer);

      // Registrar impacto financeiro
      await supabase.from('financial_events').insert({
        type: 'subscription_created',
        plan,
        mrr_impact: plan === 'agency' ? 997 : 297,
        stripe_event_id: event.id
      });

      await logEvent('stripe_subscription_created', { plan, mrrBrl: plan === 'agency' ? 997 : 297 }, 'info');
      await sendEmail({ to: sub.metadata.email, template: 'welcome_paid', data: { plan } });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from('users').update({
        subscription_status: sub.status
      }).eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const { data: user } = await supabase.from('users')
        .select('email, plan').eq('stripe_subscription_id', sub.id).single();

      await supabase.from('users').update({
        plan: 'free', credits_remaining: 1, subscription_status: 'canceled'
      }).eq('stripe_subscription_id', sub.id);

      await supabase.from('financial_events').insert({
        type: 'subscription_canceled',
        plan: user?.plan,
        mrr_impact: -(user?.plan === 'agency' ? 997 : 297),
        stripe_event_id: event.id
      });

      await logEvent('stripe_subscription_canceled', { plan: user?.plan, mrrBrl: user?.plan === 'agency' ? 997 : 297 }, 'info');

      // Sequência automática de recuperação de churn
      await scheduleCancelRecovery(user?.email, user?.plan);
      break;
    }

    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice;
      await logEvent('stripe_invoice_payment_failed', { invoiceId: inv.id }, 'warning');
      await sendEmail({
        to: inv.customer_email!,
        template: 'payment_failed',
        data: { amount: (inv.amount_due / 100).toFixed(2) }
      });
      break;
    }

    case 'invoice.paid': {
      // Renovação bem-sucedida — registrar receita recorrente real
      const inv = event.data.object as Stripe.Invoice;
      await supabase.from('revenue_log').insert({
        amount: inv.amount_paid / 100,
        currency: inv.currency,
        stripe_invoice_id: inv.id,
        paid_at: new Date().toISOString()
      });
      break;
    }
  }

  return new Response('OK', { status: 200 });
}

async function scheduleCancelRecovery(email: string | undefined, plan: string | undefined) {
  if (!email) return;
  // Insere emails na fila para envio nos dias D+1, D+3, D+7 após cancelamento
  for (const day of [1, 3, 7]) {
    await supabase.from('email_queue').insert({
      to_email: email,
      template: `churn_recovery_d${day}`,
      data: { plan },
      send_at: new Date(Date.now() + day * 86400000).toISOString()
    });
  }
}
```

### Configurar webhook no Stripe

```
Dashboard → Developers → Webhooks → Add endpoint
URL: https://neuroconvert.com.br/api/webhook
Events:
  customer.subscription.created
  customer.subscription.updated
  customer.subscription.deleted
  invoice.payment_failed
  invoice.paid
```

---

## 4. Banco de dados — Supabase

```sql
-- Usuários e planos
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 1,
  subscription_status TEXT,
  subscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Laudos gerados (base para analytics de produto)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  url TEXT NOT NULL,
  sector TEXT,
  score INTEGER,
  report_json JSONB,
  scraping_ok BOOLEAN DEFAULT TRUE,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos financeiros (base do dashboard financeiro)
CREATE TABLE financial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,   -- 'subscription_created' | 'subscription_canceled' | 'upgrade'
  plan TEXT,
  mrr_impact INTEGER,   -- positivo = receita nova, negativo = churn
  stripe_event_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de receita real por invoice
CREATE TABLE revenue_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'brl',
  stripe_invoice_id TEXT UNIQUE,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fila de emails agendados (onboarding, churn recovery, etc.)
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template TEXT NOT NULL,
  data JSONB,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed'
  send_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos de observabilidade do sistema
CREATE TABLE system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  data JSONB,
  severity TEXT DEFAULT 'info',   -- 'info' | 'warning' | 'error' | 'critical'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshots diários de métricas (histórico e projeção)
CREATE TABLE daily_metrics (
  date DATE PRIMARY KEY,
  mrr NUMERIC DEFAULT 0,
  new_subscribers INTEGER DEFAULT 0,
  churned_subscribers INTEGER DEFAULT 0,
  total_active_subscribers INTEGER DEFAULT 0,
  total_analyses INTEGER DEFAULT 0,
  free_to_paid_conversions INTEGER DEFAULT 0,
  api_error_rate NUMERIC DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0
);
```

---

## 5. Deploy na Vercel

**Domínio próprio é opcional.** Até comprares um domínio, usa a URL de produção que a Vercel atribui (`https://<projeto>.vercel.app`) em `NEXT_PUBLIC_URL`, no webhook de teste Stripe e em links de email. Mais tarde, aponta o domínio em **Project → Settings → Domains** e actualiza `NEXT_PUBLIC_URL`.

**Plano Hobby:** a Vercel limita o número de crons activos — se o deploy falhar por quota, reduz entradas em `vercel.json` ou faz upgrade.

```bash
npm install -g vercel
vercel          # Deploy inicial
vercel --prod   # Deploy de produção

# Configurar todas as variáveis
vercel env add ANTHROPIC_API_KEY
vercel env add FIRECRAWL_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_PRICE_PRO
# STRIPE_PRICE_AGENCY só se usares preço Stripe manual para Agência
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM
vercel env add ADMIN_SECRET
vercel env add ADMIN_EMAIL
vercel env add NEXT_PUBLIC_URL
vercel env add CRON_SECRET
```

`CRON_SECRET` na Vercel é o que permite o header automático `Authorization: Bearer …` nos crons. Podes repetir o mesmo valor que `ADMIN_SECRET`. Chamadas manuais (`curl`) podem usar `Authorization: Bearer` com `CRON_SECRET` ou `ADMIN_SECRET` (útil em dev local sem `CRON_SECRET`).

### `vercel.json` — crons de automação

```json
{
  "crons": [
    { "path": "/api/cron/email-queue",    "schedule": "0 4 * * *"  },
    { "path": "/api/cron/daily-snapshot", "schedule": "0 3 * * *"  },
    { "path": "/api/cron/usage-monitor",  "schedule": "0 9 * * *"  },
    { "path": "/api/health",              "schedule": "0 5 * * *"  }
  ]
}
```

No **plano Hobby**, cada cron só pode correr **no máximo uma vez por dia** (expressões como `0 * * * *` ou `*/5 * * * *` bloqueiam o deploy). Os horários acima estão ajustados para isso; em **Pro** podes voltar a agendamentos mais frequentes (ex.: fila de email hora a hora, health a cada 5 min).

---

## 6. Contas e serviços necessários

| Serviço | Link | Custo inicial | O que faz |
|---------|------|---------------|-----------|
| Anthropic | console.anthropic.com | Pay-per-use (~$0.02/análise) | IA de neuromarketing |
| Firecrawl | firecrawl.dev | 500 scrapes grátis | Scraping de URLs |
| Stripe | dashboard.stripe.com | 2,9% por transação | Pagamentos e assinaturas |
| Supabase | supabase.com | Grátis (500MB) | Banco de dados |
| Vercel | vercel.com | Grátis | Hosting e crons |
| Resend | resend.com | 3.000 emails/mês grátis | Emails transacionais |
| UptimeRobot | uptimerobot.com | Grátis | Monitor de disponibilidade |

**Custo mensal com zero clientes: R$ 0**
**Com 50 clientes Pro: ~R$ 1.200 infra → R$ 14.850 receita → margem 92%**

---

## 7. Fluxo completo do usuário

```
1. Acessa neuroconvert.com.br
2. Cola URL + seleciona setor → Gerar Laudo
3. Firecrawl scrapa a página real
4. Claude gera o laudo de neuromarketing (20s)
5. Resultado exibido com score, dimensões e quick wins
6. Ao tentar 2ª análise → Stripe Checkout (freemium gate)
7. Pagamento confirmado → webhook → créditos ativados
8. Emails automáticos em cada etapa da jornada
9. Admin dashboard mostra tudo em tempo real
```

---

## 8. Sistema de Mensageria

O sistema cobre três frentes: emails transacionais para o usuário em cada etapa da jornada, alertas internos para você como operador, e uma fila de emails agendados para sequências automáticas de onboarding e recuperação de churn.

### 8.1 Biblioteca de emails — `lib/email.ts`

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

/*
  QUANDO CADA EMAIL É DISPARADO:

  welcome_free         → Usuário criou conta (cadastro)
  free_limit_reached   → Usou a análise gratuita — gate de conversão
  welcome_paid         → Pagamento confirmado pelo Stripe webhook
  payment_failed       → Stripe reporta falha na cobrança
  subscription_canceled→ Cancelamento confirmado → inicia sequência churn
  churn_recovery_d1    → D+1: oferta de pausa em vez de cancelar
  churn_recovery_d3    → D+3: case de sucesso de cliente similar
  churn_recovery_d7    → D+7: desconto de 30% por tempo limitado
  report_ready         → Laudo gerado (com score no assunto)
  weekly_mrr_report    → Toda segunda-feira para o admin (você)
*/

export async function sendEmail({
  to, template, data
}: {
  to: string;
  template: string;
  data?: Record<string, unknown>;
}) {
  const subjects: Record<string, string> = {
    'welcome_free':          'Bem-vindo ao NeuroConvert — sua análise espera',
    'free_limit_reached':    `Score ${data?.score}/100 — veja o que encontramos`,
    'welcome_paid':          'Acesso Pro ativado — 10 análises disponíveis',
    'payment_failed':        'Problema com seu pagamento — ação necessária',
    'subscription_canceled': 'Sentimos sua falta — estamos aqui',
    'churn_recovery_d1':     'Quer pausar ao invés de cancelar?',
    'churn_recovery_d3':     'Como clientes similares dobraram a conversão',
    'churn_recovery_d7':     '30% de desconto — apenas hoje',
    'report_ready':          `Laudo pronto: ${data?.url}`,
    'weekly_mrr_report':     `NeuroConvert — MRR semanal`,
  };

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to,
    subject: subjects[template] || 'NeuroConvert',
    html: buildEmailBody(template, data),
  });
}

function buildEmailBody(template: string, data?: Record<string, unknown>): string {
  // Em produção substitua por React Email para templates visuais bonitos
  // Padrão visual: fundo branco, fonte sans-serif, cor primária #1D9E75
  const base = (content: string) => `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
      <img src="${process.env.NEXT_PUBLIC_URL}/logo.png" alt="NeuroConvert" height="32" style="margin-bottom:24px"/>
      ${content}
      <p style="font-size:12px;color:#94A3B8;margin-top:32px">
        NeuroConvert · <a href="${process.env.NEXT_PUBLIC_URL}/unsubscribe" style="color:#94A3B8">Descadastrar</a>
      </p>
    </div>`;

  const bodies: Record<string, string> = {
    'free_limit_reached': base(`
      <h2 style="color:#0F172A">Sua página tem score <strong style="color:#BA7517">${data?.score}/100</strong></h2>
      <p style="color:#475569">Encontramos oportunidades de conversão em <em>${data?.url}</em>.</p>
      <p style="color:#475569">Para analisar mais páginas e monitorar a evolução:</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/planos"
         style="display:inline-block;background:#1D9E75;color:white;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-weight:500;margin-top:12px">
        Ver planos — a partir de R$ 297/mês
      </a>`),

    'payment_failed': base(`
      <h2 style="color:#0F172A">Problema com seu pagamento</h2>
      <p style="color:#475569">A cobrança de <strong>R$ ${data?.amount}</strong> não foi processada.</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/billing"
         style="display:inline-block;background:#E24B4A;color:white;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-weight:500;margin-top:12px">
        Atualizar forma de pagamento
      </a>`),

    'churn_recovery_d7': base(`
      <h2 style="color:#0F172A">Última chance — 30% de desconto</h2>
      <p style="color:#475569">Estamos oferecendo 30% de desconto nos próximos 3 meses para você voltar.</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/reativar?coupon=VOLTA30"
         style="display:inline-block;background:#1D9E75;color:white;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-weight:500;margin-top:12px">
        Reativar com 30% de desconto
      </a>`),
  };

  return bodies[template] || base('<p style="color:#475569">Obrigado por usar o NeuroConvert.</p>');
}
```

### 8.2 Observabilidade — `lib/monitoring.ts` (`logEvent`)

Eventos estruturados na tabela `system_events` (Supabase). Consulte no dashboard SQL ou exponha uma vista admin; evite PII em `data`.

```typescript
import { logEvent } from '@/lib/monitoring';

// Ex.: falha crítica
await logEvent('stripe_webhook_handler_error', { type: event.type, message: msg }, 'critical');
```

### 8.3 Processador da fila de emails — `app/api/cron/email-queue/route.ts`

Roda a cada hora via cron da Vercel. Processa emails agendados como as sequências de churn recovery.

```typescript
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: pending } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('send_at', new Date().toISOString())
    .limit(50);

  let sent = 0;
  for (const job of (pending || [])) {
    try {
      await sendEmail({ to: job.to_email, template: job.template, data: job.data });
      await supabase.from('email_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', job.id);
      sent++;
    } catch {
      await supabase.from('email_queue').update({ status: 'failed' }).eq('id', job.id);
    }
  }

  return Response.json({ processed: sent });
}
```

---

## 9. Dashboard Admin — saúde e operações

O dashboard fica em `/admin` (protegido por senha) e reúne tudo que você precisa para operar o negócio sem surpresas: saúde do sistema, métricas de produto e financeiro em tempo real.

### 9.1 Proteção da rota admin — `middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const auth = req.cookies.get('admin_auth')?.value;
    if (auth !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}
```

### 9.2 Health checks — `app/api/health/route.ts`

Verifique cada dependência crítica. Conecte este endpoint ao UptimeRobot para ser avisado em caso de falha.

```typescript
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
import { logEvent } from '@/lib/monitoring';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const checks: Record<string, { ok: boolean; latencyMs?: number; detail?: string }> = {};

  // 1. Banco de dados
  try {
    const t = Date.now();
    await supabase.from('users').select('count').limit(1);
    checks.database = { ok: true, latencyMs: Date.now() - t };
  } catch (e) {
    checks.database = { ok: false, detail: String(e) };
  }

  // 2. Claude API (teste mínimo para não gastar tokens)
  try {
    const t = Date.now();
    await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      .messages.create({
        model: 'claude-sonnet-4-20250514', max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }]
      });
    checks.claude_api = { ok: true, latencyMs: Date.now() - t };
  } catch (e) {
    checks.claude_api = { ok: false, detail: String(e) };
  }

  // 3. Stripe
  try {
    const t = Date.now();
    await new Stripe(process.env.STRIPE_SECRET_KEY!).prices.list({ limit: 1 });
    checks.stripe = { ok: true, latencyMs: Date.now() - t };
  } catch (e) {
    checks.stripe = { ok: false, detail: String(e) };
  }

  // 4. Taxa de erro de scraping (últimas 100 análises)
  const { data: recent } = await supabase
    .from('reports').select('scraping_ok')
    .order('created_at', { ascending: false }).limit(100);

  const errorRate = recent?.length
    ? recent.filter(r => !r.scraping_ok).length / recent.length
    : 0;

  checks.scraping = {
    ok: errorRate < 0.15,
    detail: `${(errorRate * 100).toFixed(1)}% de falhas nas últimas 100 análises`
  };

  // 5. Latência média das últimas 24h
  const { data: latencyRows } = await supabase
    .from('reports').select('latency_ms')
    .gte('created_at', new Date(Date.now() - 86400000).toISOString());

  const avgLatency = latencyRows?.length
    ? Math.round(latencyRows.reduce((a, r) => a + (r.latency_ms || 0), 0) / latencyRows.length)
    : 0;

  checks.latency_24h = {
    ok: avgLatency < 30000,
    latencyMs: avgLatency,
    detail: avgLatency > 30000 ? 'Latência acima de 30s — verificar Claude API' : undefined
  };

  const allOk = Object.values(checks).every(c => c.ok);

  if (!allOk) {
    const failed = Object.entries(checks).filter(([, v]) => !v.ok).map(([k]) => k);
    await logEvent('health_check_degraded', { failed }, 'error');
  }

  return Response.json(
    { status: allOk ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  );
}
```

### 9.3 API de métricas do dashboard — `app/api/admin/metrics/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const last30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { data: activeUsers },
    { data: newSubs },
    { data: churns },
    { count: totalAnalyses },
    { count: analysesLast30 },
    { count: totalUsers },
    { data: history }
  ] = await Promise.all([
    supabase.from('users').select('plan').in('subscription_status', ['active', 'trialing']),
    supabase.from('financial_events').select('plan, mrr_impact').eq('type', 'subscription_created').gte('created_at', startOfMonth),
    supabase.from('financial_events').select('plan, mrr_impact').eq('type', 'subscription_canceled').gte('created_at', startOfMonth),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', last30),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('daily_metrics').select('*').gte('date', last30).order('date')
  ]);

  const mrr = (activeUsers || []).reduce((acc, u) =>
    acc + (u.plan === 'agency' ? 997 : u.plan === 'pro' ? 297 : 0), 0);

  const newMrr  = (newSubs  || []).reduce((a, e) => a + (e.mrr_impact || 0), 0);
  const churnMrr = Math.abs((churns || []).reduce((a, e) => a + (e.mrr_impact || 0), 0));

  const paidUsers = (activeUsers || []).filter(u => u.plan !== 'free').length;
  const conversionRate = totalUsers ? ((paidUsers / (totalUsers as number)) * 100).toFixed(1) : '0';

  const planDist = (activeUsers || []).reduce((acc, u) => {
    acc[u.plan] = (acc[u.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Response.json({
    // Financeiro
    mrr,
    arr: mrr * 12,
    new_mrr_month: newMrr,
    churned_mrr_month: churnMrr,
    net_new_mrr: newMrr - churnMrr,
    projected_mrr_next_month: mrr + (newMrr - churnMrr),

    // Assinantes
    total_active_subscribers: paidUsers,
    new_subscribers_month: newSubs?.length || 0,
    churned_month: churns?.length || 0,
    plan_distribution: planDist,
    conversion_rate_pct: parseFloat(conversionRate),

    // Produto
    total_analyses: totalAnalyses,
    analyses_last_30_days: analysesLast30,

    // Histórico para gráficos
    daily_history: history,
    generated_at: new Date().toISOString()
  });
}
```

### 9.4 Snapshot diário — `app/api/cron/daily-snapshot/route.ts`

Roda toda madrugada. Salva métricas do dia para histórico e envia resumo semanal toda segunda.

```typescript
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) return new Response('Unauthorized', { status: 401 });

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  const [
    { data: activeUsers },
    { count: analyses },
    { data: newSubs },
    { data: churns }
  ] = await Promise.all([
    supabase.from('users').select('plan').in('subscription_status', ['active', 'trialing']),
    supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', yesterday),
    supabase.from('financial_events').select('mrr_impact').eq('type', 'subscription_created').gte('created_at', yesterday),
    supabase.from('financial_events').select('mrr_impact').eq('type', 'subscription_canceled').gte('created_at', yesterday),
  ]);

  const mrr = (activeUsers || []).reduce((a, u) =>
    a + (u.plan === 'agency' ? 997 : u.plan === 'pro' ? 297 : 0), 0);

  await supabase.from('daily_metrics').upsert({
    date: today,
    mrr,
    new_subscribers: newSubs?.length || 0,
    churned_subscribers: churns?.length || 0,
    total_active_subscribers: (activeUsers || []).filter(u => u.plan !== 'free').length,
    total_analyses: analyses || 0,
  });

  // Resumo semanal toda segunda-feira
  if (new Date().getDay() === 1) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      template: 'weekly_mrr_report',
      data: { mrr, newSubs: newSubs?.length || 0, churns: churns?.length || 0 }
    });
  }

  return Response.json({ ok: true, date: today, mrr });
}
```

---

## 10. Métricas Financeiras e Curvas Microeconômicas

Estas são as métricas que determinam a saúde real do negócio e orientam decisões de preço, produto e investimento.

### 10.1 As métricas fundamentais e suas fórmulas

```
MRR (Monthly Recurring Revenue)
  = (assinantes_pro × 297) + (assinantes_agency × 997)

ARR = MRR × 12

Churn Rate mensal
  = cancelamentos_no_mês / assinantes_início_do_mês
  Alvo saudável: < 3% mensal
  Alvo excelente: < 1,5% mensal

LTV (Lifetime Value)
  = ARPU / Churn Rate mensal
  Exemplos com ticket Pro de R$297:
    Churn  8% → LTV R$ 3.712
    Churn  5% → LTV R$ 5.940
    Churn  2% → LTV R$14.850
    Churn  1% → LTV R$29.700
  Objetivo: LTV/CAC > 3 (saudável) · > 5 (excelente)

CAC (Customer Acquisition Cost)
  = gasto total em aquisição / novos clientes no período
  No PLG puro nos primeiros meses: CAC ≈ R$ 0

NRR (Net Revenue Retention)
  = (MRR_início + expansão - churn - downgrade) / MRR_início × 100
  > 100% = crescendo mesmo sem novos clientes (upsell compensa churn)
  Alvo: NRR > 110%

Break-even de assinantes
  = custo_fixo_mensal / (ARPU × margem_bruta)
  = R$1.500 / (R$297 × 0,88) = 6 assinantes Pro para cobrir toda a infra
```

### 10.2 Curva de churn e impacto no LTV (a mais importante)

O churn é a variável que mais impacta o valor do negócio. Uma redução de 3% para 1% de churn mensal multiplica o LTV por 5 vezes sem nenhum novo cliente:

```
Com 50 assinantes Pro e diferentes taxas de churn:

  Churn 8%/mês:  LTV R$3.712  → portfólio de 50 clientes vale R$185.600
  Churn 5%/mês:  LTV R$5.940  → portfólio vale R$297.000   (+60%)
  Churn 2%/mês:  LTV R$14.850 → portfólio vale R$742.500   (+300%)
  Churn 1%/mês:  LTV R$29.700 → portfólio vale R$1.485.000 (+700%)

Conclusão: reduzir churn de 5% para 2% vale mais do que dobrar a base de clientes.
Invista em sucesso do cliente antes de escalar aquisição.
```

### 10.3 Biblioteca de cálculos — `lib/microeconomics.ts`

```typescript
// Lifetime Value
export const calcLTV = (arpu: number, monthlyChurnRate: number) =>
  arpu / monthlyChurnRate;

// Ponto de break-even
export const calcBreakEven = (fixedCosts: number, arpu: number, grossMargin: number) =>
  Math.ceil(fixedCosts / (arpu * grossMargin));

// Payback period em meses
export const calcPayback = (cac: number, arpu: number, grossMargin: number) =>
  cac === 0 ? 0 : Math.ceil(cac / (arpu * grossMargin));

// Net Revenue Retention
export const calcNRR = (mrrStart: number, expansion: number, churn: number, downgrade: number) =>
  ((mrrStart + expansion - churn - downgrade) / mrrStart) * 100;

// Margem bruta
export const calcGrossMargin = (mrr: number, variableCosts: number) =>
  ((mrr - variableCosts) / mrr) * 100;

/*
  Projeção de MRR com S-curve (modelo logístico de crescimento)

  O crescimento de SaaS segue uma curva S:
  - Fase 1 (lento): primeiros adotantes, boca a boca inicial
  - Fase 2 (acelerado): PLG viralizando, conteúdo chegando
  - Fase 3 (estabilizando): mercado saturando, crescimento linear

  Parâmetros realistas para NeuroConvert:
  - targetMrr: R$150.000 (teto estimado do nicho, ~500 assinantes Pro)
  - monthlyGrowthRate: 0.3 (30% de aceleração no pico)
  - months: 24 (projeção para 2 anos)
*/
export function projectedMrrSCurve({
  currentMrr, targetMrr, monthlyGrowthRate, months
}: {
  currentMrr: number;
  targetMrr: number;
  monthlyGrowthRate: number;
  months: number;
}) {
  return Array.from({ length: months }, (_, i) => {
    const t = i + 1;
    const t0 = months / 2;
    const projected = targetMrr / (1 + Math.exp(-monthlyGrowthRate * (t - t0)));
    return {
      month: t,
      mrr: Math.round(Math.max(currentMrr, projected)),
      subscribers: Math.round(Math.max(currentMrr, projected) / 297)
    };
  });
}

/*
  Análise de elasticidade de preço
  Use quando considerar aumentar o preço.

  Regra do dobro: se você dobrar o preço e perder < 25% dos clientes,
  a receita aumenta. Teste sempre com novos usuários, não com base atual.
*/
export function priceElasticityTest({
  currentPrice, currentSubs, newPrice, estimatedChurnPct
}: {
  currentPrice: number;
  currentSubs: number;
  newPrice: number;
  estimatedChurnPct: number;
}) {
  const retained = currentSubs * (1 - estimatedChurnPct);
  const currentRevenue = currentPrice * currentSubs;
  const newRevenue = newPrice * retained;
  return {
    currentRevenue,
    newRevenue,
    delta: newRevenue - currentRevenue,
    worthIncreasing: newRevenue > currentRevenue,
    breakEvenChurnPct: 1 - (currentRevenue / (newPrice * currentSubs)),
  };
}
```

### 10.4 Sinais de quando ajustar o preço

```
SINAL PARA AUMENTAR PREÇO:
  → Conversão free → pago consistentemente > 15% (valor percebido alto)
  → Churn nos primeiros 30 dias < 2% (clientes não cancelam por preço)
  → Usuários dizem "barato demais para o que entrega"
  → LTV/CAC > 10 (suas margens têm espaço enorme)
  → Você está ficando sem capacidade de atender novos clientes

SINAL PARA TESTAR REDUÇÃO:
  → Conversão free → pago < 2% há mais de 60 dias
  → Churn nos primeiros 30 dias > 8% (compradores arrependidos)
  → Suporte recebe muitos "quero mas não posso pagar agora"

COMO TESTAR SEM RISCO:
  → Mude o preço somente para novos usuários (não retroativo)
  → Teste por pelo menos 30 dias antes de concluir
  → Use a função priceElasticityTest acima para estimar o impacto
```

### 10.5 Endpoint de projeções — `app/api/admin/projections/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import {
  calcLTV, calcNRR, calcGrossMargin, projectedMrrSCurve
} from '@/lib/microeconomics';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) return new Response('Unauthorized', { status: 401 });

  const { data: metrics } = await supabase
    .from('daily_metrics').select('*').order('date', { ascending: false }).limit(90);

  const latest = metrics?.[0];
  const currentMrr = latest?.mrr || 0;

  // Churn rate real calculado dos últimos 30 dias
  const last30 = metrics?.slice(0, 30) || [];
  const avgChurned = last30.reduce((a, m) => a + (m.churned_subscribers || 0), 0) / 30;
  const avgActive = latest?.total_active_subscribers || 1;
  const monthlyChurnRate = avgChurned / avgActive;

  // Custo variável estimado (API)
  const totalAnalyses = last30.reduce((a, m) => a + (m.total_analyses || 0), 0);
  const estimatedVariableCost = (totalAnalyses * 0.12) + 1500; // R$0.12/análise + fixo

  return Response.json({
    current_mrr: currentMrr,
    arr: currentMrr * 12,

    // Métricas de churn
    monthly_churn_rate_pct: (monthlyChurnRate * 100).toFixed(2),
    ltv_pro:    Math.round(calcLTV(297, monthlyChurnRate)),
    ltv_agency: Math.round(calcLTV(997, monthlyChurnRate)),

    // Saúde financeira
    gross_margin_pct: calcGrossMargin(currentMrr, estimatedVariableCost).toFixed(1),
    break_even_subscribers: Math.ceil(1500 / (297 * 0.88)),

    // NRR do mês
    nrr_pct: calcNRR(
      currentMrr,
      (latest?.new_subscribers || 0) * 297,
      (latest?.churned_subscribers || 0) * 297,
      0
    ).toFixed(1),

    // Projeção S-curve para 24 meses
    mrr_forecast_24m: projectedMrrSCurve({
      currentMrr,
      targetMrr: 150000,
      monthlyGrowthRate: 0.3,
      months: 24
    }),

    // Cenários
    scenarios: {
      pessimista:  { mrr_12m: Math.round(currentMrr * Math.pow(1.08, 12)), churn: '8%', desc: 'PLG fraco, sem conteúdo' },
      base:        { mrr_12m: Math.round(currentMrr * Math.pow(1.18, 12)), churn: '4%', desc: 'PLG funcionando, conteúdo regular' },
      otimista:    { mrr_12m: Math.round(currentMrr * Math.pow(1.30, 12)), churn: '2%', desc: 'PLG viral, agências como canal' },
    }
  });
}
```

---

## 11. Alertas de Upgrade de Ferramentas

Cada serviço tem um ponto de saturação. Este cron roda diariamente e avisa antes de você atingir qualquer limite — evitando cortes de serviço que afetam o usuário.

### 11.1 Thresholds de upgrade por ferramenta

| Ferramenta | Limite do plano atual | Alertar em | Próximo plano | Custo |
|------------|----------------------|------------|---------------|-------|
| Firecrawl | 500 scrapes/mês (free) | 400 scrapes | Hobby | US$16/mês |
| Vercel | 100GB bandwidth / 100h build | 80GB ou 80h | Pro | US$20/mês |
| Supabase | 500MB storage / 2GB bandwidth | 400MB ou 1.6GB | Pro | US$25/mês |
| Resend | 3.000 emails/mês | 2.400 emails | Starter | US$20/mês |
| Claude API | Budget definido manualmente | 80% do budget | — | Pay-per-use |
| Stripe | Taxa padrão 2,9% | MRR > R$50K | Negociar desconto | — |

### 11.2 Cron de monitoramento de uso — `app/api/cron/usage-monitor/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { logEvent } from '@/lib/monitoring';
import { sendEmail } from '@/lib/email';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) return new Response('Unauthorized', { status: 401 });

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const lastHour = new Date(Date.now() - 3600000).toISOString();
  const alerts: string[] = [];
  const usage: Record<string, unknown> = {};

  // 1. Uso de scraping Firecrawl este mês
  const { count: scrapes } = await supabase
    .from('reports').select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth).eq('scraping_ok', true);

  usage.firecrawl_scrapes = scrapes;
  if ((scrapes || 0) >= 475) alerts.push('🔴 CRÍTICO: Firecrawl em ' + scrapes + '/500. Upgrade AGORA em firecrawl.dev/pricing (Hobby US$16/mês)');
  else if ((scrapes || 0) >= 400) alerts.push('⚠️ Firecrawl em ' + scrapes + '/500 scrapes. Planeje upgrade para Hobby (US$16/mês)');

  // 2. Emails enviados este mês
  const { count: emails } = await supabase
    .from('email_queue').select('*', { count: 'exact', head: true })
    .eq('status', 'sent').gte('created_at', startOfMonth);

  usage.resend_emails = emails;
  if ((emails || 0) >= 2800) alerts.push('🔴 CRÍTICO: Resend em ' + emails + '/3000. Upgrade para Starter (US$20/mês)');
  else if ((emails || 0) >= 2400) alerts.push('⚠️ Resend em ' + emails + '/3000 emails');

  // 3. Custo estimado da Claude API
  const { count: totalReports } = await supabase
    .from('reports').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth);

  const apiCostUSD = (totalReports || 0) * 0.021;  // ~$0.021 por análise (input+output)
  const apiCostBRL = apiCostUSD * 5.8;
  usage.api_cost_usd = apiCostUSD.toFixed(2);
  usage.api_cost_brl = apiCostBRL.toFixed(0);

  if (apiCostUSD > 100) alerts.push('⚠️ Claude API estimado em US$' + apiCostUSD.toFixed(0) + ' este mês. Configure budget alert em console.anthropic.com');

  // 4. Latência média na última hora
  const { data: latencyRows } = await supabase
    .from('reports').select('latency_ms').gte('created_at', lastHour);

  const avgLatency = latencyRows?.length
    ? Math.round(latencyRows.reduce((a, r) => a + (r.latency_ms || 0), 0) / latencyRows.length)
    : 0;

  usage.avg_latency_ms = avgLatency;
  if (avgLatency > 35000) alerts.push('🔴 Latência alta: ' + (avgLatency/1000).toFixed(1) + 's na última hora. Verificar status.anthropic.com');

  // 5. Margem atual
  const { data: activeUsers } = await supabase
    .from('users').select('plan').in('subscription_status', ['active', 'trialing']);

  const mrr = (activeUsers || []).reduce((a, u) =>
    a + (u.plan === 'agency' ? 997 : u.plan === 'pro' ? 297 : 0), 0);

  const infraCost = apiCostBRL + 100 + 150 + 50 + 500;  // API + Vercel + Crisp + Resend + contador
  const margin = mrr > 0 ? ((mrr - infraCost) / mrr * 100) : 0;
  usage.mrr = mrr;
  usage.infra_cost_brl = infraCost.toFixed(0);
  usage.gross_margin_pct = margin.toFixed(1);

  if (margin < 70 && mrr > 0) {
    alerts.push('⚠️ Margem caindo: ' + margin.toFixed(0) + '%. Revisar custos. MRR: R$' + mrr + ' / Infra: R$' + infraCost.toFixed(0));
  }

  // Persistir alertas consolidados (email ao admin continua opcional)
  if (alerts.length > 0) {
    const severity = alerts.some(a => a.startsWith('🔴')) ? 'error' : 'warning';
    await logEvent('usage_monitor', { messages: alerts }, severity);
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      template: 'weekly_mrr_report',
      data: { alerts, ...usage }
    });
  }

  return Response.json({
    checked_at: new Date().toISOString(),
    alerts_count: alerts.length,
    alerts,
    usage
  });
}
```

### 11.3 Calculadora de custo por análise — referência para precificação

```
Custo real por análise gerada:

  Claude API
    Input:  ~3.000 tokens × $3,00/1M  = $0.009
    Output: ~800 tokens   × $15,00/1M = $0.012
    Subtotal: $0.021 USD ≈ R$ 0.12

  Firecrawl (plano Hobby US$16/mês ÷ 3.000 scrapes)
    Custo por scrape: US$0.005 ≈ R$ 0.03

  Infra fixa rateada (Vercel + Supabase + Resend + contador)
    R$1.350/mês ÷ 500 análises médias = R$ 2.70 por análise

  CUSTO TOTAL POR ANÁLISE: ≈ R$ 2.85

  RECEITA POR ANÁLISE (plano Pro com 10 análises/mês)
    R$297 ÷ 10 = R$ 29.70

  MARGEM POR ANÁLISE: 90.4% ← por isso SaaS é o melhor modelo de negócio

  INSIGHT: Se o usuário Pro usa em média 4 análises/mês (não as 10),
  o custo real cai para R$0.40/usuário em API, e a margem sobe para 98%.
  Monitore o uso médio real — ele define se você pode baixar o preço
  mantendo margem ou aumentar o limite de análises sem custo relevante.
```

### 11.4 Quando fazer cada upgrade — decisão baseada em dados

```
FIRECRAWL
  Free (0 → 400 scrapes/mês)  → Gratuito
  Hobby (400 → 3.000)         → US$16/mês — faça ao atingir 400
  Standard (3.000 → 10.000)   → US$50/mês — você tem ~50+ clientes ativos
  Scale (10.000+)             → US$200/mês — você tem ~200+ clientes ativos

VERCEL
  Free (< 100GB bandwidth)    → Gratuito
  Pro (100GB–1TB)             → US$20/mês — faça ao atingir 150+ usuários/dia
  Sinal: função serverless timeout ou lentidão em horários de pico

SUPABASE
  Free (< 500MB)              → Gratuito
  Pro (até 8GB)               → US$25/mês — faça ao atingir 450MB
  Sinal: queries ficando lentas ou erros de storage no cron

RESEND
  Free (3.000 emails/mês)     → Gratuito
  Starter (50.000/mês)        → US$20/mês — faça ao atingir 250+ usuários
  Sinal: 300+ usuários ativos com sequências de onboarding disparando

CLAUDE API
  Não tem plano fixo — pay-per-use
  Configure: console.anthropic.com → Billing → Add credit grant + set budget alert
  Recomendação: alerta em US$80/mês, hard limit em US$200/mês
  Sinal para revisar: custo API > 12% do MRR → otimizar o prompt ou revisar preço

STRIPE
  Padrão: 2,9% + R$0,30 por transação
  Quando MRR > R$50.000: entrar em contato para negociar taxa customizada
  Quando MRR > R$200.000: considerar Stripe Enterprise (taxa < 2%)
  Sinal: compare % que vai para Stripe vs margem — se > 4%, negocie

REGRA GERAL DE UPGRADE
  Não faça upgrade preventivo. Faça quando:
  (a) estiver em 80% do limite atual, OU
  (b) o custo de NÃO fazer upgrade (downtime, usuário afetado) > custo do upgrade
  A maioria dos upgrades custa menos de R$150/mês e protege R$5.000+ de MRR.
```

---

## 12. Primeiros passos — hoje

```
DIA 1 (agora):
  → Abrir as 6 contas gratuitas (Anthropic, Firecrawl, Stripe, Supabase, Vercel, Resend)
  → Criar o projeto Next.js e configurar o .env.local
  → Testar o endpoint /api/analyze manualmente com uma URL

SEMANA 1:
  → 5 laudos manuais de sites conhecidos → publicar no LinkedIn
  → Stripe configurado com os dois produtos (Pro e Agência)
  → MVP deployado na Vercel com análise funcionando

SEMANA 2:
  → Webhook do Stripe ativo e testado
  → Emails transacionais configurados no Resend
  → Primeiro cliente pagante — mesmo que via link manual do Stripe

SEMANA 3:
  → Health check em /api/health conectado ao UptimeRobot (gratuito)
  → Crons da Vercel ativos (email queue + daily snapshot)
  → Dashboard admin em /admin com métricas básicas

MÊS 2:
  → Com 10+ clientes, calcular churn e LTV reais — não estimados
  → Testar ajuste de preço com novos usuários (não retroativo)
  → Revisar thresholds de upgrade com base no uso real medido

MÊS 3:
  → NRR calculado com dados de 60 dias — sinal de saúde do negócio
  → Se NRR > 100%: investir em aquisição (o produto retém)
  → Se NRR < 100%: investir em produto e sucesso do cliente antes de crescer
```

---

## Referência rápida — links de documentação

| Serviço | Documentação |
|---------|--------------|
| Anthropic | docs.anthropic.com |
| Firecrawl | docs.firecrawl.dev |
| Stripe Billing | stripe.com/docs/billing |
| Stripe Webhooks | stripe.com/docs/webhooks |
| Supabase | supabase.com/docs |
| Vercel Crons | vercel.com/docs/cron-jobs |
| Resend | resend.com/docs |
| UptimeRobot | uptimerobot.com (monitor gratuito do /api/health) |

---

> **Regra de ouro do negócio de dono:**
> Monitore toda semana: MRR, churn, alertas de infra e custo por análise.
> Mude algo somente quando os dados pedirem — não por ansiedade.
> Um negócio com 50 clientes, 2% de churn e 88% de margem é extraordinário.
> Proteja a margem antes de escalar o volume.
