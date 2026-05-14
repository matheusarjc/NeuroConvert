# Klarivy — Especificação de Mudanças de Arquitetura

> **Propósito:** Este documento especifica todas as mudanças necessárias na arquitetura da aplicação Klarivy — back-end, banco de dados, DevOps e front-end. Serve como base direta para criação de Issues no Linear. Cada item contém descrição técnica, critérios de aceitação e arquivos afetados.

**Versão:** 1.0 | **Data:** Maio 2026 | **Status:** Aprovado para implementação

---

## Como usar este documento no Linear

Cada issue possui um ID (`KLV-XXX`), área, prioridade, complexidade em story points (XS=1, S=2, M=3, L=5, XL=8), dependências, descrição técnica precisa, arquivos afetados e critérios de aceitação testáveis. Importe as issues agrupando por área (Backend, Frontend, Database, DevOps). A **Parte III** define a ordem de sprints recomendada e o caminho crítico.

Convenções de prioridade:
- **P0 — Crítico:** bloqueia produto, retenção ou segurança. Implementar antes de qualquer feature nova.
- **P1 — Alto:** impacta conversão, receita ou experiência diretamente.
- **P2 — Médio:** melhoria de produto, analytics ou qualidade.
- **P3 — Baixo:** polish, documentação, otimizações futuras.

---

## Parte I — Correções do Produto Existente

### Prioridade Crítica (P0)

---

#### KLV-001 — Implementar cron de renovação mensal do crédito Free

**Área:** Backend + DevOps
**Prioridade:** P0 — Crítico
**Complexidade:** S (2 pts)
**Dependências:** Nenhuma

**Contexto:**
O plano Free concede 1 laudo por mês. Atualmente não existe cron que execute essa renovação. Após usar o primeiro laudo, o usuário free fica com `credits_remaining = 0` permanentemente — sem motivo para retornar antes de pagar. Isso destrói o ciclo PLG e a métrica de D30 retention do produto.

**Descrição técnica:**
Criar a rota de cron `/api/cron/renew-free-credits` e registrá-la no `vercel.json` com schedule `0 6 1 * *` (primeiro dia do mês, 6h00 UTC).

A rota deve:
1. Verificar autenticação via `requireCronAuth()` (já existe em `lib/cron-auth.ts`)
2. Executar no Supabase com `createServiceClient()`:
   ```sql
   UPDATE users
   SET credits_remaining = 1
   WHERE plan = 'free' AND credits_remaining = 0;
   ```
3. Logar o resultado via `logEvent('cron_free_credits_renewed', { updated_count }, 'info')`
4. Retornar `{ ok: true, updated: N }`

**Arquivos afetados:**
- `app/api/cron/renew-free-credits/route.ts` — **criar** (novo arquivo)
- `vercel.json` — adicionar entrada de cron

**Snippet vercel.json:**
```json
{
  "path": "/api/cron/renew-free-credits",
  "schedule": "0 6 1 * *"
}
```

**Critérios de aceitação:**
- [ ] Rota `/api/cron/renew-free-credits` retorna 401 sem `CRON_SECRET` válido
- [ ] Usuários com `plan='free'` e `credits_remaining=0` têm crédito restaurado para 1
- [ ] Usuários com `plan='free'` e `credits_remaining=1` não são alterados
- [ ] Usuários com `plan='pro'` ou `plan='agency'` não são afetados
- [ ] Evento `cron_free_credits_renewed` aparece em `system_events` após execução
- [ ] Entrada correta em `vercel.json` e deployada na Vercel

---

#### KLV-002 — Implementar listagem de laudos históricos no dashboard

**Área:** Frontend + Backend
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** KLV-003

**Contexto:**
`/dashboard/laudos` exibe apenas conteúdo estático placeholder. Usuários Pro pagantes não conseguem acessar o histórico de laudos que já geraram. Os dados existem na tabela `reports` mas não são expostos na interface. Isso elimina um motivo central de retorno ao dashboard.

**Descrição técnica:**
Criar rota de API `GET /api/dashboard/reports` que busca laudos do usuário autenticado:
```typescript
// Query
const { data } = await supabase
  .from('reports')
  .select('id, url, score, sector, scraping_ok, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

Atualizar `app/dashboard/laudos/page.tsx` para consumir essa rota e renderizar tabela com: URL (truncada a 40 chars), setor, score (badge colorido: <40 vermelho, 40-70 amarelo, >70 verde), data, link para `/dashboard/laudos/[id]`.

**Arquivos afetados:**
- `app/api/dashboard/reports/route.ts` — **criar**
- `app/dashboard/laudos/page.tsx` — substituir placeholder por listagem real
- `components/dashboard/ReportRow.tsx` — **criar** (componente de linha da tabela)

**Critérios de aceitação:**
- [ ] Listagem exibe os laudos reais da tabela `reports` para o usuário autenticado
- [ ] Score exibido com badge colorido (vermelho / amarelo / verde)
- [ ] URL da página analisada exibida (truncada se > 40 chars, com tooltip do URL completo)
- [ ] Data formatada em `dd/MM/yyyy HH:mm`
- [ ] Clique na linha navega para `/dashboard/laudos/[id]`
- [ ] Estado vazio com CTA "Gerar primeiro laudo" quando `reports` está vazio
- [ ] Loading state durante fetch
- [ ] Usuário sem autenticação é redirecionado (depende de KLV-005)

---

#### KLV-003 — Rota persistente de laudo individual `/dashboard/laudos/[id]`

**Área:** Frontend + Backend
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Contexto:**
O laudo gerado em `/analise` existe apenas no estado React local do `AnalyzeClient`. Se o usuário fechar a aba, o resultado é perdido permanentemente — mesmo com os dados salvos em `reports`. Não há URL para revisitar, compartilhar ou comparar laudos ao longo do tempo. O `report_id` já é retornado pelo RPC `complete_analysis` na resposta da API `/api/analyze`.

**Descrição técnica:**

**Back-end:** Criar `GET /api/dashboard/reports/[id]` que busca o laudo completo:
```typescript
const { data } = await supabase
  .from('reports')
  .select('*')
  .eq('id', params.id)
  .eq('user_id', userId)  // RLS extra por segurança
  .single();
```

**Front-end — AnalyzeClient:** Após receber resposta `200` de `/api/analyze`, extrair `report_id` e fazer redirect:
```typescript
if (result.report_id) {
  router.push(`/dashboard/laudos/${result.report_id}`);
}
```

**Front-end — página do laudo:** Criar `app/dashboard/laudos/[id]/page.tsx` que renderiza o `report_json` completo: score, 5 dimensões, 3 quick wins, URL analisada, data, setor. Incluir botão "Compartilhar" (gera URL pública com token — roadmap) e botão "Re-analisar".

**Arquivos afetados:**
- `app/api/dashboard/reports/[id]/route.ts` — **criar**
- `app/dashboard/laudos/[id]/page.tsx` — **criar**
- `components/analyze/AnalyzeClient.tsx` — adicionar redirect após análise
- `components/report/ReportView.tsx` — **criar** (componente de visualização do laudo, reutilizável em `/analise` e `/dashboard/laudos/[id]`)

**Critérios de aceitação:**
- [ ] Após análise bem-sucedida em `/analise`, usuário é redirecionado para `/dashboard/laudos/[report_id]`
- [ ] A URL `/dashboard/laudos/[id]` renderiza o laudo completo sem necessidade de re-análise
- [ ] Usuário que tenta acessar laudo de outro usuário recebe 404 (RLS)
- [ ] Página tem `<title>` com URL analisada e score
- [ ] Botão "Re-analisar" dispara nova análise e substitui o laudo atual

---

#### KLV-004 — Corrigir email síncrono em `/api/analyze`

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** XS (1 pt)
**Dependências:** Nenhuma

**Contexto:**
Em `app/api/analyze/route.ts` existe uma chamada direta `await sendEmail()` quando o usuário free usa o último crédito (retorno 402). Isso viola a regra de ouro do projeto: emails **nunca** são enviados de forma síncrona dentro de handlers de API. O motivo é que falhas do Resend derrubariam o fluxo de análise e aumentam a latência da resposta em centenas de milissegundos. A regra existe em `context.md` seção 7 e em `lib/email.ts`.

**Descrição técnica:**
Localizar no `app/api/analyze/route.ts` o bloco que chama `sendEmail()` diretamente. Substituir por insert na `email_queue`:

```typescript
// ❌ REMOVER
await sendEmail({ to: user.email, template: 'free_limit_reached', data: { score, url } });

// ✅ SUBSTITUIR POR
await supabase.from('email_queue').insert({
  to_email: user.email,
  template: 'free_limit_reached',
  data: { score, url },
  status: 'pending',
  send_at: new Date().toISOString(),
});
```

**Arquivos afetados:**
- `app/api/analyze/route.ts` — remover `sendEmail()`, adicionar insert em `email_queue`

**Critérios de aceitação:**
- [ ] Nenhuma chamada a `sendEmail()` ou `deliverTransactionalEmail()` existe em `app/api/analyze/route.ts`
- [ ] Insert em `email_queue` com template `free_limit_reached` é executado quando `credits_remaining` chega a 0
- [ ] A resposta 402 não é atrasada por latência de Resend
- [ ] Email `free_limit_reached` é entregue pelo cron `/api/cron/email-queue` na próxima execução

---

#### KLV-005 — Auth guard no `/dashboard` e rotas protegidas

**Área:** Backend (middleware)
**Prioridade:** P0 — Crítico
**Complexidade:** S (2 pts)
**Dependências:** Nenhuma

**Contexto:**
O arquivo `middleware.ts` contém `return NextResponse.next()` comentado como "VEN-9" para a rota `/dashboard`. Qualquer pessoa não autenticada consegue acessar o dashboard diretamente. Além de ser uma falha de segurança, usuários que chegam sem sessão veem estados de erro e dados vazios em vez de serem redirecionados para login.

**Descrição técnica:**
Em `middleware.ts`, adicionar verificação de sessão Supabase para as rotas `/dashboard/*` e `/admin/*`:

```typescript
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie handlers */ } }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtected = protectedRoutes.some(r => req.nextUrl.pathname.startsWith(r));

  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/conta/entrar';
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

**Arquivos afetados:**
- `middleware.ts` — substituir lógica atual pela verificação de sessão

**Critérios de aceitação:**
- [ ] `GET /dashboard` sem sessão redireciona para `/conta/entrar?redirect=/dashboard`
- [ ] `GET /dashboard/laudos` sem sessão redireciona para `/conta/entrar?redirect=/dashboard/laudos`
- [ ] Usuário autenticado acessa `/dashboard` normalmente
- [ ] Parâmetro `?redirect=` é respeitado após login bem-sucedido
- [ ] Rota `/analise` permanece acessível sem autenticação (análise pré-login é permitida)
- [ ] `/admin/*` retorna 401 sem `ADMIN_SECRET` válido

---

### Prioridade Alta (P1)

---

#### KLV-006 — Corrigir fricção no fluxo de paywall e upgrade

**Área:** Frontend
**Prioridade:** P1 — Alto
**Complexidade:** S (2 pts)
**Dependências:** Nenhuma

**Contexto:**
O fluxo de upgrade tem duas fontes de fricção desnecessárias: (a) o campo de email no checkout precisa ser preenchido manualmente, mesmo que o usuário já esteja autenticado e o email esteja disponível na sessão; (b) após a criação da sessão Stripe Checkout, o URL é exibido como texto "Abrir Stripe Checkout" em vez de redirecionar automaticamente — cada segundo adicional de fricção reduz a taxa de conversão para o plano pago.

**Descrição técnica:**
Em `components/analyze/AnalyzeClient.tsx` (bloco do paywall 402):

```typescript
// Obter email da sessão Supabase
const { data: { session } } = await getBrowserSupabase().auth.getSession();
const userEmail = session?.user?.email ?? '';

// Enviar email preenchido no body do checkout
const res = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: STRIPE_PRICE_PRO, email: userEmail }),
});

const { url } = await res.json();

// Redirecionar imediatamente
if (url) window.location.href = url;
```

No `app/api/checkout/route.ts`, passar `customer_email` na criação da sessão Stripe:
```typescript
const session = await stripe.checkout.sessions.create({
  customer_email: body.email || undefined,
  // ...demais params
});
```

**Arquivos afetados:**
- `components/analyze/AnalyzeClient.tsx` — auto-preenchimento de email e redirect automático
- `app/api/checkout/route.ts` — aceitar e repassar `email` ao Stripe
- `schemas/checkout-request.ts` — adicionar campo `email?: string` ao schema Zod

**Critérios de aceitação:**
- [ ] Campo de email no Stripe Checkout já vem preenchido com o email do usuário logado
- [ ] Após POST em `/api/checkout` retornar `{ url }`, o browser redireciona automaticamente
- [ ] Nenhum link intermediário "Abrir Stripe Checkout" é exibido ao usuário
- [ ] Fluxo funciona mesmo quando `email` não está disponível (campo opcional)

---

#### KLV-007 — Página `/sucesso` distingue trial de pagamento real

**Área:** Frontend
**Prioridade:** P1 — Alto
**Complexidade:** S (2 pts)
**Dependências:** Nenhuma

**Contexto:**
A página `/sucesso` exibe "Pagamento recebido" durante o trial de 7 dias — o que é tecnicamente incorreto e pode gerar expectativas erradas sobre cobrança. Além disso, o redirect pós-conversão leva para `/analise` em vez do dashboard, perdendo a oportunidade de onboarding.

**Descrição técnica:**
Na página `/sucesso`, verificar via `session_id` (query param do Stripe) se é trial ou pagamento:

```typescript
// app/sucesso/page.tsx
const stripe = getStripe();
const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
const isTrial = session.subscription
  ? (await stripe.subscriptions.retrieve(session.subscription as string)).trial_end !== null
  : false;
```

Exibir mensagem adequada:
- Trial: "Plano Pro ativado — 7 dias gratuitos. Sua primeira cobrança ocorre em [data]."
- Pago: "Plano Pro ativado. Bem-vindo à Klarivy."

Redirect após 3 segundos para `/dashboard` com estado de boas-vindas (query param `?onboarding=true`).

**Arquivos afetados:**
- `app/sucesso/page.tsx` — lógica de distinção trial/pago e redirect para dashboard

**Critérios de aceitação:**
- [ ] Página exibe "7 dias gratuitos" durante trial, com data exata da primeira cobrança
- [ ] Página exibe "Plano Pro ativado" para pagamentos sem trial
- [ ] Após 3 segundos, usuário é redirecionado para `/dashboard`
- [ ] `/dashboard` com `?onboarding=true` exibe modal ou banner de boas-vindas
- [ ] Fallback tratado se `session_id` ausente ou inválido

---

#### KLV-008 — Criar templates HTML de churn recovery no Resend

**Área:** DevOps + Backend
**Prioridade:** P1 — Alto
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Contexto:**
O webhook Stripe agenda `churn_recovery_d1`, `churn_recovery_d3` e `churn_recovery_d7` na `email_queue` quando uma assinatura é cancelada. Se esses templates não existirem no Resend, a sequência de recovery mais valiosa do negócio falha silenciosamente — o status na `email_queue` muda para `failed` sem alerta. Nenhum email é enviado.

**Descrição técnica:**

**Parte 1 — Templates HTML no Resend:**
Criar três templates no painel do Resend com os nomes exatos:
- `churn_recovery_d1`: tom empático, pergunta se prefere pausar em vez de cancelar
- `churn_recovery_d3`: cases de sucesso, prova social
- `churn_recovery_d7`: oferta especial (desconto ou mês extra), urgência

**Parte 2 — Alertas de falha em `email-delivery.ts`:**
Em `lib/email-delivery.ts`, adicionar log `critical` quando template não for encontrado no Resend:
```typescript
if (error?.statusCode === 422) {
  await logEvent('email_template_not_found', { template: opts.template, to: opts.to }, 'critical');
}
```

**Parte 3 — Variáveis disponíveis nos templates:**
O campo `data` da `email_queue` para churn recovery contém: `{ user_email, plan, canceled_at, recovery_url }`. O `recovery_url` deve apontar para `/api/checkout?recovery=true` com link direto para reativar.

**Arquivos afetados:**
- Resend Dashboard — criar 3 templates HTML (operação manual)
- `lib/email-delivery.ts` — adicionar log critical para template não encontrado
- `app/api/webhook/route.ts` — verificar se `recovery_url` está sendo incluído no `data` da fila

**Critérios de aceitação:**
- [ ] Templates `churn_recovery_d1`, `churn_recovery_d3`, `churn_recovery_d7` existem no Resend
- [ ] Email D+1 chega ao usuário no dia seguinte ao cancelamento
- [ ] Email D+7 contém oferta com link de reativação funcional
- [ ] Falha de template gera evento `critical` em `system_events`
- [ ] Status de emails na `email_queue` muda para `sent` (não `failed`) após entrega

---

#### KLV-009 — `/dashboard/plano` com dados reais e portal Stripe

**Área:** Frontend + Backend
**Prioridade:** P1 — Alto
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Contexto:**
A página `/dashboard/plano` exibe conteúdo estático com link para `/analise`. Usuários Pro precisam saber: plano atual, créditos restantes, data de renovação, status da assinatura e opção de cancelar. A ausência dessas informações cria tickets de suporte desnecessários e aumenta a percepção de falta de controle.

**Descrição técnica:**
Criar `GET /api/dashboard/plan` que retorna dados do usuário e, para plano Pro, detalhes da assinatura Stripe:

```typescript
const user = await supabase.from('users')
  .select('plan, credits_remaining, subscription_status, subscribed_at, stripe_subscription_id')
  .eq('id', userId).single();

let renewalDate = null;
if (user.stripe_subscription_id) {
  const sub = await getStripe().subscriptions.retrieve(user.stripe_subscription_id);
  renewalDate = new Date(sub.current_period_end * 1000);
}
```

Para o portal de cancelamento, criar `POST /api/billing-portal` que gera sessão do Stripe Billing Portal:
```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: user.stripe_customer_id,
  return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/plano`,
});
return Response.json({ url: portalSession.url });
```

**Arquivos afetados:**
- `app/api/dashboard/plan/route.ts` — **criar**
- `app/api/billing-portal/route.ts` — **criar**
- `app/dashboard/plano/page.tsx` — substituir placeholder por dados reais

**Critérios de aceitação:**
- [ ] Plano atual exibido (Free / Pro / Agency)
- [ ] Créditos restantes exibidos com barra de progresso (ex: 7/10)
- [ ] Data de próxima renovação exibida para plano Pro
- [ ] Botão "Gerenciar assinatura" redireciona para Stripe Billing Portal
- [ ] Usuário Free vê CTA de upgrade com preço e benefícios
- [ ] Status `past_due` exibe alerta de pagamento pendente

---

### Prioridade Média (P2)

---

#### KLV-010 — Adicionar prova social real na landing page

**Área:** Frontend
**Prioridade:** P2 — Médio
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Contexto:**
A landing exibe autoridade científica (Cialdini, Kahneman, Nielsen Norman) mas nenhuma evidência de uso real. O score demonstrado é explicitamente "fictício". Para um produto que vende otimização de conversão, a própria landing deve ser o exemplo máximo de conversão bem feita.

**Descrição técnica:**
Adicionar três elementos à `components/landing/LandingPage.tsx`:

1. **Contador dinâmico de laudos gerados:** `GET /api/stats/public` retorna `{ total_reports: N }` consultando `SELECT COUNT(*) FROM reports`. Exibir como "X+ laudos gerados" (arredondado para baixo na centena mais próxima).

2. **Seção de depoimentos:** Mínimo 2 depoimentos reais com nome, empresa e resultado mensurável. Estrutura: `{ name, role, company, quote, result }`.

3. **Score real de uma página conhecida:** Publicar análise de uma URL pública (ex: página de um e-commerce parceiro) com score real e metodologia explicada. Remove o "fictício" e prova o produto.

**Arquivos afetados:**
- `app/api/stats/public/route.ts` — **criar** (endpoint público, sem auth)
- `components/landing/LandingPage.tsx` — adicionar seções de social proof
- `components/landing/TestimonialCard.tsx` — **criar**

**Critérios de aceitação:**
- [ ] Contador de laudos gerados exibido e atualizado (sem expor número exato — arredondar)
- [ ] Mínimo 2 depoimentos com nome real, empresa e resultado específico
- [ ] Score demo é de URL real (não fictício)
- [ ] Seção de social proof visível acima do fold em mobile e desktop

---

#### KLV-011 — Flag e aviso de conteúdo truncado na análise

**Área:** Backend + Frontend
**Prioridade:** P2 — Médio
**Complexidade:** XS (1 pt)
**Dependências:** Nenhuma

**Contexto:**
O conteúdo das páginas é truncado em `content.slice(0, 6000)` antes de ser enviado ao Claude. Páginas longas (sales pages, landing pages de infoproduto) têm CTA, preços e formulários cortados — exatamente os elementos mais relevantes para CRO. O usuário recebe um laudo parcial sem saber.

**Descrição técnica:**
Em `app/api/analyze/route.ts`, detectar truncamento e incluir flag no retorno:

```typescript
const RAW_CONTENT = scrapedContent;
const MAX_CHARS = 6000;
const content = RAW_CONTENT.slice(0, MAX_CHARS);
const contentTruncated = RAW_CONTENT.length > MAX_CHARS;

// Incluir no report_json salvo e na resposta
const report = { ...parsedReport, content_truncated: contentTruncated };
```

Na interface do laudo (`ReportView.tsx`), exibir banner quando `content_truncated === true`:
> ⚠️ Esta página tem conteúdo extenso. A análise cobre os primeiros 6.000 caracteres. Seções de preço, CTA e formulário podem não ter sido incluídas.

**Arquivos afetados:**
- `app/api/analyze/route.ts` — adicionar flag `content_truncated`
- `lib/report-json.ts` — incluir `content_truncated` no tipo `NeuroReport`
- `components/report/ReportView.tsx` — exibir banner de aviso quando flag ativo

**Critérios de aceitação:**
- [ ] `report_json` inclui campo `content_truncated: boolean`
- [ ] Banner de aviso exibido na UI quando `content_truncated === true`
- [ ] Banner não exibido quando conteúdo não foi truncado
- [ ] `logEvent` registra `content_truncated: true` quando ocorre (para monitoramento de frequência)

---

#### KLV-012 — Instalar Posthog e instrumentar funil de conversão

**Área:** Frontend + DevOps
**Prioridade:** P2 — Médio
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Contexto:**
Não há product analytics instalado. O `system_events` captura eventos técnicos, mas o funil de produto — landing → signup → primeiro laudo → paywall → checkout → conversão — é uma caixa preta. Decisões de produto são tomadas sem dados. Posthog é gratuito até 1 milhão de eventos/mês.

**Descrição técnica:**
Instalar `posthog-js` e `posthog-node`. Criar `lib/posthog.ts` com cliente configurado.

Instrumentar **8 eventos críticos** de funil:

| Evento | Onde disparar | Propriedades |
|--------|---------------|--------------|
| `landing_viewed` | `LandingPage.tsx` mount | `{ source, referrer }` |
| `signup_started` | `/conta/criar` page load | `{ redirect_to }` |
| `signup_completed` | Após `signUp()` success | `{ plan: 'free' }` |
| `analyze_started` | POST `/api/analyze` início | `{ sector, has_context }` |
| `analyze_completed` | Após laudo gerado | `{ score, sector, content_truncated }` |
| `paywall_hit` | Resposta 402 de `/api/analyze` | `{ credits_used, plan }` |
| `checkout_started` | POST `/api/checkout` | `{ price_id }` |
| `checkout_completed` | Webhook `checkout.session.completed` | `{ plan, is_trial }` |

**Arquivos afetados:**
- `lib/posthog.ts` — **criar** (cliente server-side e client-side)
- `app/layout.tsx` — adicionar `PosthogProvider`
- `components/landing/LandingPage.tsx` — `landing_viewed`
- `app/conta/criar/page.tsx` — `signup_started`, `signup_completed`
- `app/api/analyze/route.ts` — `analyze_started`, `analyze_completed`, `paywall_hit`
- `app/api/checkout/route.ts` — `checkout_started`
- `app/api/webhook/route.ts` — `checkout_completed`
- `.env.example` — adicionar `NEXT_PUBLIC_POSTHOG_KEY` e `NEXT_PUBLIC_POSTHOG_HOST`

**Critérios de aceitação:**
- [ ] Eventos aparecem no painel Posthog em tempo real
- [ ] Funil `landing_viewed → signup_completed → analyze_completed → checkout_completed` configurável no Posthog
- [ ] `user_id` do Supabase é associado ao perfil Posthog após signup (`posthog.identify`)
- [ ] Nenhum dado PII além de `user_id` é enviado ao Posthog
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` documentada no `.env.example`

---

## Parte II — Módulo Marketplace Intelligence (Novo)

### 2.1 Decisões Macro de Arquitetura

**Decisão 1 — Módulo dentro do Klarivy (não app separado)**
O módulo Marketplace é implementado dentro da mesma codebase Next.js, com novas rotas em `/marketplace/*` e `/api/marketplace/*`. Justificativa: mesma auth Supabase, mesmo Stripe, mesma infraestrutura Vercel, sem duplicação de custos fixos. Um dev familiarizado com a codebase existente produz em horas o que levaria dias em um repo separado.

**Decisão 2 — Prefixo `mp_` para todas as tabelas e arquivos novos**
Todas as tabelas do banco usam o prefixo `mp_`. Todos os arquivos de biblioteca usam o diretório `/lib/marketplace/`. Isso mantém separação clara de domínio sem fragmentar a codebase.

**Decisão 3 — Mercado Livre API pública para dados de anúncio e ranking**
A API pública do Mercado Livre (`api.mercadolibre.com`) fornece dados de anúncio, posição em search e Q&A gratuitamente, sem scraping. Isso elimina risco de bloqueio para o canal principal. Shopee não tem API pública e usa Firecrawl (já instalado).

**Decisão 4 — Planos separados por módulo, mesmo Stripe**
Os planos `mp_seller` (R$147/mês) e `mp_agency` (R$347/mês) são criados como novos preços no mesmo Stripe. O campo `plan` na tabela `users` aceita os novos valores. Um usuário pode ter plano Pro (landing pages) E mp_seller (marketplace) simultaneamente — o campo `plan` deve evoluir para um conjunto de flags ou campo `plans text[]`.

**Decisão 5 — Regra de ouro se mantém intacta**
Todos os emails do módulo marketplace passam pela `email_queue`. Nenhuma chamada a Resend é feita diretamente em crons ou API routes. O padrão de `logEvent()` + `system_events` se aplica a todos os novos componentes.

---

### 2.2 DevOps e Infraestrutura

---

#### KLV-013 — Variáveis de ambiente — Módulo Marketplace

**Área:** DevOps
**Prioridade:** P0 — Crítico
**Complexidade:** XS (1 pt)
**Dependências:** Nenhuma

**Descrição técnica:**
Adicionar as seguintes variáveis em `.env.example`, `.env.local` e no painel da Vercel (Project Settings → Environment Variables):

```env
# Mercado Livre OAuth (obter em https://developers.mercadolivre.com.br)
ML_APP_ID=
ML_APP_SECRET=
ML_REDIRECT_URI=https://www.klarivy.com/api/marketplace/callback

# Marketplace — Stripe (criar os preços no Dashboard Stripe primeiro)
STRIPE_PRICE_MP_SELLER=price_...
STRIPE_PRICE_MP_AGENCY=price_...

# Posthog (KLV-012)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Arquivos afetados:**
- `.env.example` — adicionar todas as variáveis acima com comentários
- Vercel Dashboard — configurar em produção e preview

**Critérios de aceitação:**
- [ ] Todas as variáveis documentadas no `.env.example` com comentário explicando onde obter o valor
- [ ] Build da Vercel não falha por variável ausente (variáveis com `||` fallback onde aplicável)
- [ ] `ML_APP_ID` e `ML_APP_SECRET` presentes na Vercel antes do deploy do módulo

---

#### KLV-014 — Vercel Crons — Três novos jobs de marketplace

**Área:** DevOps
**Prioridade:** P0 — Crítico
**Complexidade:** XS (1 pt)
**Dependências:** KLV-034, KLV-035, KLV-036

**Descrição técnica:**
Adicionar ao `vercel.json` as três entradas de cron:

```json
{
  "crons": [
    { "path": "/api/cron/renew-free-credits",  "schedule": "0 6 1 * *"  },
    { "path": "/api/cron/email-queue",          "schedule": "0 */4 * * *" },
    { "path": "/api/cron/daily-snapshot",       "schedule": "0 5 * * *"  },
    { "path": "/api/cron/usage-monitor",        "schedule": "0 6 * * *"  },
    { "path": "/api/cron/mp-rank-tracker",      "schedule": "0 7 * * *"  },
    { "path": "/api/cron/mp-qa-monitor",        "schedule": "0 8 * * *"  },
    { "path": "/api/cron/mp-catalog-triage",    "schedule": "0 9 * * 1"  }
  ]
}
```

**Arquivos afetados:**
- `vercel.json` — atualizar array de crons

**Critérios de aceitação:**
- [ ] Vercel Dashboard exibe todos os 7 crons registrados
- [ ] Crons de marketplace disparam nos horários corretos sem conflito com crons existentes
- [ ] Cada cron retorna 200 ou 401 (nunca 404 por rota inexistente)

---

#### KLV-015 — Stripe — Criar preços para Marketplace

**Área:** DevOps
**Prioridade:** P0 — Crítico
**Complexidade:** XS (1 pt)
**Dependências:** Nenhuma

**Descrição técnica:**
No Stripe Dashboard, criar dois novos preços recorrentes mensais:

| Nome | Valor | Intervalo | Metadata |
|------|-------|-----------|----------|
| Klarivy Marketplace Seller | R$147,00 BRL | Mensal | `plan: mp_seller` |
| Klarivy Marketplace Agency | R$347,00 BRL | Mensal | `plan: mp_agency` |

Copiar os `price_id` gerados (formato `price_XXXX`) e adicionar como `STRIPE_PRICE_MP_SELLER` e `STRIPE_PRICE_MP_AGENCY` nas variáveis de ambiente.

No `app/api/webhook/route.ts`, adicionar handling para os novos planos:
```typescript
const planFromMetadata = session.metadata?.plan; // 'mp_seller' | 'mp_agency'
if (['mp_seller', 'mp_agency'].includes(planFromMetadata)) {
  await supabase.from('users').update({ plan: planFromMetadata }).eq('id', userId);
}
```

**Arquivos afetados:**
- Stripe Dashboard — operação manual (criar preços)
- `.env.example` / `.env.local` / Vercel — adicionar variáveis
- `app/api/webhook/route.ts` — adicionar handling para novos planos
- `app/api/checkout/route.ts` — aceitar `STRIPE_PRICE_MP_SELLER` e `STRIPE_PRICE_MP_AGENCY` como `priceId` válidos

**Critérios de aceitação:**
- [ ] Preços criados e ativos no Stripe Dashboard
- [ ] Checkout com `STRIPE_PRICE_MP_SELLER` gera sessão válida
- [ ] Webhook `checkout.session.completed` atualiza `plan` para `mp_seller` corretamente
- [ ] Schema Zod do checkout aceita os novos `priceId` sem erro de validação

---

#### KLV-016 — Resend — Quatro templates de email do módulo marketplace

**Área:** DevOps
**Prioridade:** P1 — Alto
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Descrição técnica:**
Criar no Resend Dashboard quatro templates HTML com os nomes exatos abaixo. Cada template recebe variáveis via campo `data` da `email_queue`.

| Template | Gatilho | Variáveis disponíveis |
|----------|---------|----------------------|
| `mp_rank_drop_alert` | Rank drop crítico (>5 posições) | `listing_title`, `keyword`, `old_position`, `new_position`, `listing_url` |
| `mp_qa_new_gaps` | Novas perguntas sem resposta (≥3) | `listing_title`, `gap_count`, `top_questions[]`, `listing_url` |
| `mp_weekly_catalog_report` | Cron semanal segunda-feira | `total_listings`, `critical_count`, `top_5_critical[]`, `dashboard_url` |
| `mp_competitor_updated` | Concorrente muda anúncio monitorado | `competitor_url`, `listing_title`, `change_summary`, `dashboard_url` |

Todos os templates devem usar `from: noreply@klarivy.com` e tom profissional. Incluir link de cancelamento de alertas no rodapé (`/marketplace/alerts/preferences`).

**Arquivos afetados:**
- Resend Dashboard — operação manual (criar 4 templates HTML)
- `lib/email-delivery.ts` — adicionar os 4 novos templates ao mapa `subjectFor()`

```typescript
mp_rank_drop_alert: `Alerta: ${data.listing_title} caiu para posição ${data.new_position}`,
mp_qa_new_gaps: `${data.gap_count} perguntas sem resposta em ${data.listing_title}`,
mp_weekly_catalog_report: `Relatório semanal — ${data.critical_count} SKUs críticos`,
mp_competitor_updated: `Concorrente atualizou anúncio — ${data.listing_title}`,
```

**Critérios de aceitação:**
- [ ] 4 templates existem no Resend com os nomes exatos especificados
- [ ] `subjectFor()` em `email-delivery.ts` cobre todos os 4 novos templates
- [ ] Email de rank drop chega em até 4h do disparo (próxima execução do `email-queue` cron)
- [ ] Links no email apontam para `NEXT_PUBLIC_URL` correto

---

### 2.3 Banco de Dados

---

#### KLV-017 — Migration SQL — Sete tabelas `mp_*`

**Área:** Database
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Descrição técnica:**
Criar nova migration em `supabase/migrations/YYYYMMDD_marketplace_module.sql`:

```sql
-- =============================================
-- Klarivy — Marketplace Intelligence Module
-- Migration: marketplace_module
-- =============================================

-- 1. Contas de vendedor conectadas
CREATE TABLE mp_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform        text NOT NULL CHECK (platform IN ('ml', 'shopee')),
  seller_id       text NOT NULL,
  access_token    text,
  token_expires_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, seller_id)
);

-- 2. Anúncios/SKUs monitorados
CREATE TABLE mp_listings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL REFERENCES mp_accounts(id) ON DELETE CASCADE,
  platform_item_id text NOT NULL,
  url              text NOT NULL,
  title            text,
  category         text,
  keywords         text[] DEFAULT '{}',
  is_active        bool NOT NULL DEFAULT true,
  last_analyzed_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, platform_item_id)
);

-- 3. Snapshots de análise
CREATE TABLE mp_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES mp_listings(id) ON DELETE CASCADE,
  score       int NOT NULL CHECK (score BETWEEN 0 AND 100),
  report_json jsonb NOT NULL DEFAULT '{}',
  scraping_ok bool NOT NULL DEFAULT true,
  latency_ms  int,
  snapshot_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Histórico de ranking por keyword
CREATE TABLE mp_rank_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES mp_listings(id) ON DELETE CASCADE,
  keyword       text NOT NULL,
  position      int,
  total_results int,
  tracked_at    date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (listing_id, keyword, tracked_at)
);

-- 5. Análise de Perguntas & Respostas
CREATE TABLE mp_qa_intelligence (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id          uuid NOT NULL REFERENCES mp_listings(id) ON DELETE CASCADE,
  total_questions     int NOT NULL DEFAULT 0,
  unanswered_count    int NOT NULL DEFAULT 0,
  unanswered_json     jsonb NOT NULL DEFAULT '[]',
  suggested_additions text,
  analyzed_at         timestamptz NOT NULL DEFAULT now()
);

-- 6. Triagens de catálogo
CREATE TABLE mp_catalog_triages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES mp_accounts(id) ON DELETE CASCADE,
  total_listings  int NOT NULL DEFAULT 0,
  triage_json     jsonb NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 7. Alertas gerados pelo sistema
CREATE TABLE mp_alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  uuid REFERENCES mp_listings(id) ON DELETE SET NULL,
  type        text NOT NULL CHECK (type IN ('rank_drop','qa_new_gaps','score_drop','competitor_improved')),
  severity    text NOT NULL CHECK (severity IN ('critical','warning','info')) DEFAULT 'info',
  data_json   jsonb NOT NULL DEFAULT '{}',
  is_read     bool NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_mp_listings_account ON mp_listings(account_id);
CREATE INDEX idx_mp_snapshots_listing ON mp_snapshots(listing_id);
CREATE INDEX idx_mp_rank_history_listing_date ON mp_rank_history(listing_id, tracked_at DESC);
CREATE INDEX idx_mp_alerts_user_unread ON mp_alerts(user_id, is_read, created_at DESC);

-- RLS
ALTER TABLE mp_accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_listings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_snapshots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_rank_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_qa_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_catalog_triages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_alerts          ENABLE ROW LEVEL SECURITY;

-- RLS Policies (usuário só vê seus próprios dados)
CREATE POLICY "mp_accounts: owner only" ON mp_accounts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "mp_listings: owner only" ON mp_listings
  FOR ALL USING (
    account_id IN (SELECT id FROM mp_accounts WHERE user_id = auth.uid())
  );

CREATE POLICY "mp_snapshots: owner only" ON mp_snapshots
  FOR ALL USING (
    listing_id IN (
      SELECT l.id FROM mp_listings l
      JOIN mp_accounts a ON a.id = l.account_id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "mp_alerts: owner only" ON mp_alerts
  FOR ALL USING (user_id = auth.uid());
```

**Arquivos afetados:**
- `supabase/migrations/YYYYMMDD_marketplace_module.sql` — **criar**

**Critérios de aceitação:**
- [ ] Migration executa sem erros no Supabase
- [ ] RLS ativo em todas as 7 tabelas
- [ ] Usuário A não consegue ler dados do usuário B em nenhuma tabela `mp_*`
- [ ] Indexes criados e visíveis no Supabase Dashboard
- [ ] Foreign keys com `ON DELETE CASCADE` funcionando corretamente

---

#### KLV-018 — RPCs Supabase — `complete_mp_analysis` e `get_catalog_with_latest_scores`

**Área:** Database
**Prioridade:** P0 — Crítico
**Complexidade:** S (2 pts)
**Dependências:** KLV-017

**Descrição técnica:**

```sql
-- RPC 1: Salva snapshot e atualiza last_analyzed_at atomicamente
CREATE OR REPLACE FUNCTION complete_mp_analysis(
  p_listing_id    uuid,
  p_score         int,
  p_report_json   jsonb,
  p_scraping_ok   bool DEFAULT true,
  p_latency_ms    int  DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_snapshot_id uuid;
BEGIN
  INSERT INTO mp_snapshots (listing_id, score, report_json, scraping_ok, latency_ms)
  VALUES (p_listing_id, p_score, p_report_json, p_scraping_ok, p_latency_ms)
  RETURNING id INTO v_snapshot_id;

  UPDATE mp_listings
  SET last_analyzed_at = now()
  WHERE id = p_listing_id;

  RETURN v_snapshot_id;
END;
$$;

-- RPC 2: Catálogo com último score de cada listing
CREATE OR REPLACE FUNCTION get_catalog_with_latest_scores(p_account_id uuid)
RETURNS TABLE (
  listing_id       uuid,
  title            text,
  url              text,
  platform         text,
  category         text,
  keywords         text[],
  is_active        bool,
  last_analyzed_at timestamptz,
  latest_score     int,
  snapshot_at      timestamptz
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    l.id, l.title, l.url,
    a.platform, l.category, l.keywords, l.is_active, l.last_analyzed_at,
    s.score, s.snapshot_at
  FROM mp_listings l
  JOIN mp_accounts a ON a.id = l.account_id
  LEFT JOIN LATERAL (
    SELECT score, snapshot_at FROM mp_snapshots
    WHERE listing_id = l.id
    ORDER BY snapshot_at DESC LIMIT 1
  ) s ON true
  WHERE l.account_id = p_account_id
    AND l.is_active = true
  ORDER BY s.score ASC NULLS FIRST;
$$;
```

**Arquivos afetados:**
- `supabase/migrations/YYYYMMDD_marketplace_rpcs.sql` — **criar**

**Critérios de aceitação:**
- [ ] `complete_mp_analysis()` insere snapshot e atualiza `last_analyzed_at` na mesma transação
- [ ] `get_catalog_with_latest_scores()` retorna listings ordenados por score ascendente (mais críticos primeiro)
- [ ] Listings sem snapshot aparecem com `latest_score = NULL` (NULLS FIRST)
- [ ] Ambas as RPCs respeitam RLS — usuário só acessa seus próprios dados

---

### 2.4 Back-end — Biblioteca `/lib/marketplace`

---

#### KLV-019 — `/lib/marketplace/ml-api.ts` — Wrapper Mercado Livre API

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** S (2 pts)
**Dependências:** KLV-013

**Descrição técnica:**
Wrapper tipado sobre a API pública do Mercado Livre. Base URL: `https://api.mercadolibre.com`.

```typescript
// Tipos
export type MLItem = {
  id: string; title: string; price: number; category_id: string;
  seller_id: number; condition: string; description?: string;
  attributes: { id: string; name: string; value_name: string }[];
};

export type MLSearchResult = {
  results: { id: string; position: number }[];
  paging: { total: number };
};

export type MLQuestion = {
  id: number; text: string; status: string; date_created: string;
  answer?: { text: string; date_created: string };
};

// Funções exportadas
export async function getItem(itemId: string): Promise<MLItem>
export async function searchByKeyword(query: string, sellerId?: string): Promise<MLSearchResult>
export async function getQuestions(itemId: string): Promise<MLQuestion[]>
export async function getReviews(itemId: string): Promise<{ rating_average: number; reviews: unknown[] }>
export function extractItemIdFromUrl(url: string): string | null
// Extrai MLB123456789 de URLs do tipo mercadolivre.com.br/...MLB123456789...
```

Todas as funções devem ter `try/catch` com `logEvent('ml_api_error', {...}, 'error')` em caso de falha.

**Arquivos afetados:**
- `lib/marketplace/ml-api.ts` — **criar**

**Critérios de aceitação:**
- [ ] `getItem('MLB123456789')` retorna dados estruturados do anúncio
- [ ] `searchByKeyword('tênis masculino 42')` retorna posição do item na busca
- [ ] `extractItemIdFromUrl()` extrai ID corretamente de URLs Mercado Livre reais
- [ ] Erros da API ML são capturados e logados sem propagar exceção não tratada

---

#### KLV-020 — `/lib/marketplace/shopee-scraper.ts`

**Área:** Backend
**Prioridade:** P1 — Alto
**Complexidade:** S (2 pts)
**Dependências:** Nenhuma (Firecrawl já instalado)

**Descrição técnica:**
Wrapper do Firecrawl específico para Shopee, retornando dados no mesmo formato que `ml-api.ts` para interface unificada:

```typescript
export type MarketplaceListing = {
  title: string; description: string; price: number;
  rating: number; review_count: number;
  questions: { text: string; answered: boolean }[];
  seller_reputation: string; platform: 'ml' | 'shopee';
  raw_html_chars: number; content_truncated: boolean;
};

export async function scrapeShoeeListing(url: string): Promise<MarketplaceListing>
```

Reutilizar o cliente Firecrawl já configurado no projeto. Aplicar o mesmo limite de `slice(0, 8000)` (pode ser maior que landing pages pois a estrutura de marketplace é mais densa em informação).

**Arquivos afetados:**
- `lib/marketplace/shopee-scraper.ts` — **criar**

---

#### KLV-021 — `/lib/marketplace/rank-analyzer.ts`

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** S (2 pts)
**Dependências:** KLV-017, KLV-019

**Descrição técnica:**
```typescript
export type RankDelta = {
  keyword: string;
  position_today: number;
  position_yesterday: number | null;
  delta: number; // positivo = subiu, negativo = caiu
  severity: 'critical' | 'warning' | 'info' | 'positive';
};

// Busca posição atual via ML API e compara com último registro em mp_rank_history
export async function analyzeRankForListing(
  listingId: string,
  platformItemId: string,
  keywords: string[]
): Promise<RankDelta[]>

// Regras de severidade:
// delta <= -5: 'critical'
// delta <= -2: 'warning'
// delta >= +3: 'positive'
// else: 'info'
```

**Arquivos afetados:**
- `lib/marketplace/rank-analyzer.ts` — **criar**

---

#### KLV-022 — `/lib/marketplace/qa-analyzer.ts`

**Área:** Backend
**Prioridade:** P1 — Alto
**Complexidade:** M (3 pts)
**Dependências:** KLV-019, KLV-025

**Descrição técnica:**
```typescript
export type QAAnalysisResult = {
  total_questions: number;
  unanswered_count: number;
  unanswered: {
    question: string;
    frequency: number; // quantas vezes pergunta similar aparece
    suggested_answer: string; // gerado pelo Claude
  }[];
  suggested_description_additions: string; // texto sugerido para incorporar na descrição
};

// Busca perguntas via ML API, filtra não respondidas, chama Claude se ≥3 novas
export async function analyzeQA(
  listingId: string,
  platformItemId: string,
  currentDescription: string,
  sinceDate?: Date
): Promise<QAAnalysisResult>
```

Chamar Claude com o prompt `qa-gap-analysis` apenas quando houver ≥3 novas perguntas sem resposta desde `sinceDate`. Caso contrário, retornar contagem sem chamar API.

**Arquivos afetados:**
- `lib/marketplace/qa-analyzer.ts` — **criar**

---

#### KLV-023 — `/lib/marketplace/catalog-scorer.ts`

**Área:** Backend
**Prioridade:** P1 — Alto
**Complexidade:** M (3 pts)
**Dependências:** KLV-018, KLV-019, KLV-025

**Descrição técnica:**
```typescript
export type CatalogTriageItem = {
  listing_id: string;
  title: string;
  current_score: number | null;
  category_benchmark: number; // média da categoria (do banco de dados mp_snapshots)
  score_gap: number; // benchmark - current_score
  priority_rank: number; // 1 = mais urgente
  priority_reason: string; // gerado pelo Claude
};

// Busca todos listings ativos, roda análise em batch (paralelo com rate limiting),
// calcula score_gap, ordena por prioridade
export async function runCatalogTriage(accountId: string): Promise<CatalogTriageItem[]>
```

Rate limit: máximo 5 chamadas paralelas ao Claude para evitar throttling. Usar `Promise.allSettled` para que falha de um item não cancele os demais.

**Arquivos afetados:**
- `lib/marketplace/catalog-scorer.ts` — **criar**

---

#### KLV-024 — `/lib/marketplace/alert-engine.ts`

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** KLV-017

**Descrição técnica:**
```typescript
// Avalia deltas e dispara alertas via mp_alerts + email_queue
export async function processAlerts(
  userId: string,
  listingId: string,
  rankDeltas: RankDelta[],
  qaResult?: QAAnalysisResult
): Promise<void>
```

Regras de disparo:

| Condição | Tipo | Severidade | Email imediato? |
|----------|------|------------|-----------------|
| `delta <= -5` | `rank_drop` | `critical` | Sim — `mp_rank_drop_alert` |
| `delta <= -2` | `rank_drop` | `warning` | Não — digest semanal |
| `unanswered_count >= 5` | `qa_new_gaps` | `critical` | Sim — `mp_qa_new_gaps` |
| `unanswered_count >= 3` | `qa_new_gaps` | `warning` | Não |
| `score_drop >= 15` | `score_drop` | `critical` | Não |

Para alertas com email imediato: inserir em `mp_alerts` E em `email_queue` com `send_at = now()`.
Para alertas normais: inserir apenas em `mp_alerts` (aparece no feed do dashboard).

**Nunca chamar Resend diretamente.** Sempre via `email_queue`.

**Arquivos afetados:**
- `lib/marketplace/alert-engine.ts` — **criar**

---

#### KLV-025 — Claude Prompts — Módulo Marketplace

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** Nenhuma

**Descrição técnica:**
Criar 4 arquivos de prompt em `lib/marketplace/prompts/`:

**`marketplace-analyze.ts`** — Análise completa de anúncio. Input: `{ title, description, questions, reviews, price, seller_reputation }`. Output JSON:
```json
{
  "score": 0-100,
  "dimensions": {
    "title": { "score": 0-100, "issues": [], "quick_wins": [] },
    "description": { "score": 0-100, "issues": [], "quick_wins": [] },
    "objections": { "score": 0-100, "issues": [], "quick_wins": [] },
    "social_proof": { "score": 0-100, "issues": [], "quick_wins": [] },
    "price_anchoring": { "score": 0-100, "issues": [], "quick_wins": [] },
    "trust_urgency": { "score": 0-100, "issues": [], "quick_wins": [] }
  },
  "top_3_quick_wins": []
}
```

**`qa-gap-analysis.ts`** — Input: lista de perguntas + descrição atual. Output: lista de objeções com frequência + sugestão de texto para incorporar na descrição.

**`catalog-prioritize.ts`** — Input: lista de scores com gaps. Output: `priority_reason` textual para os top 5 mais críticos.

**`rank-drop-explain.ts`** — Input: keyword, posição anterior, posição atual, dados do anúncio. Output: hipóteses explicativas e ações recomendadas.

**Arquivos afetados:**
- `lib/marketplace/prompts/marketplace-analyze.ts` — **criar**
- `lib/marketplace/prompts/qa-gap-analysis.ts` — **criar**
- `lib/marketplace/prompts/catalog-prioritize.ts` — **criar**
- `lib/marketplace/prompts/rank-drop-explain.ts` — **criar**

**Critérios de aceitação:**
- [ ] Cada prompt retorna JSON válido parseável por `JSON.parse()` sem pós-processamento
- [ ] Score sempre entre 0 e 100
- [ ] `top_3_quick_wins` sempre array de exatamente 3 strings acionáveis
- [ ] Prompts instruem Claude a responder em PT-BR

---

### 2.5 Back-end — API Routes

---

#### KLV-026 — `POST /api/marketplace/connect`

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** KLV-013, KLV-017

**Descrição técnica:**
Dois fluxos:

**Mercado Livre (OAuth):**
- `POST /api/marketplace/connect` com `{ platform: 'ml', code: string }` troca o `code` OAuth pelo `access_token` via `https://api.mercadolibre.com/oauth/token`
- Extrai `seller_id` via `GET /api/mercadolibre.com/users/me`
- Insere em `mp_accounts`
- Auto-fetch do catálogo: `GET /api/mercadolibre.com/users/{seller_id}/items/search` → insere todos em `mp_listings`

**Shopee (URL manual):**
- `POST /api/marketplace/connect` com `{ platform: 'shopee', seller_url: string }`
- Valida formato da URL (deve ser `shopee.com.br/...`)
- Insere em `mp_accounts` sem `access_token`

**Arquivos afetados:**
- `app/api/marketplace/connect/route.ts` — **criar**
- `app/api/marketplace/callback/route.ts` — **criar** (recebe redirect OAuth do ML)
- `schemas/marketplace-connect.ts` — **criar** (Zod schema)

**Critérios de aceitação:**
- [ ] OAuth ML completo: clique → Mercado Livre → callback → mp_accounts inserido
- [ ] Auto-fetch do catálogo ML após conexão (inserção em `mp_listings`)
- [ ] Shopee: URL válida aceita, URL inválida retorna erro 422
- [ ] Reconexão de conta existente atualiza `access_token` sem duplicar `mp_accounts`

---

#### KLV-027 — `GET/POST /api/marketplace/listings`

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** S (2 pts)
**Dependências:** KLV-017, KLV-018

**Descrição técnica:**
- `GET`: chama RPC `get_catalog_with_latest_scores(account_id)` e retorna array com score mais recente de cada listing
- `POST`: recebe `{ url: string, keywords: string[] }`, extrai `platform_item_id` e `platform` da URL, insere em `mp_listings`

**Arquivos afetados:**
- `app/api/marketplace/listings/route.ts` — **criar**
- `schemas/marketplace-listing.ts` — **criar**

---

#### KLV-028 — `DELETE /api/marketplace/listings/[id]`

**Área:** Backend
**Prioridade:** P2 — Médio
**Complexidade:** XS (1 pt)
**Dependências:** KLV-017

**Descrição técnica:**
Soft delete: `UPDATE mp_listings SET is_active = false WHERE id = $id AND account_id IN (accounts do user)`. Não deletar histórico.

**Arquivos afetados:**
- `app/api/marketplace/listings/[id]/route.ts` — **criar**

---

#### KLV-029 — `POST /api/marketplace/analyze/[id]`

**Área:** Backend
**Prioridade:** P0 — Crítico
**Complexidade:** L (5 pts)
**Dependências:** KLV-017, KLV-018, KLV-019, KLV-020, KLV-025

**Descrição técnica:**
Core do módulo. Segue o mesmo padrão de `/api/analyze`:
1. Validar auth e plano (`mp_seller` ou `mp_agency`)
2. Buscar listing de `mp_listings`
3. Se `platform = 'ml'`: chamar `ml-api.ts` → `getItem()` + `getQuestions()` + `getReviews()`
4. Se `platform = 'shopee'`: chamar `shopee-scraper.ts`
5. Montar payload e chamar Claude com `marketplace-analyze` prompt
6. Parse do JSON retornado
7. Chamar RPC `complete_mp_analysis()`
8. Logar via `logEvent()`
9. Retornar laudo completo

**Arquivos afetados:**
- `app/api/marketplace/analyze/[id]/route.ts` — **criar**

**Critérios de aceitação:**
- [ ] Análise ML completa em < 15s (latência combinada ML API + Claude)
- [ ] Score e 6 dimensões retornados no JSON de resposta
- [ ] `mp_snapshots` inserido após análise bem-sucedida
- [ ] `scraping_ok: false` salvo quando ML API ou Firecrawl falham
- [ ] Usuário sem plano `mp_seller`/`mp_agency` recebe 403

---

#### KLV-030 a KLV-033 — Demais rotas API marketplace

**KLV-030 — `POST /api/marketplace/triage`**
Dispara `catalog-scorer.ts` para todos os listings ativos do `account_id`. Salva em `mp_catalog_triages`. Retorna array priorizado. Complexidade: **M**.

**KLV-031 — `GET /api/marketplace/ranks/[id]`**
Retorna `mp_rank_history` para um listing, agrupado por keyword, últimos 30 dias. Complexidade: **XS**.

**KLV-032 — `GET /api/marketplace/alerts`**
Retorna `mp_alerts` do usuário, não lidos primeiro, limite 50. Aceita query params `?type=&severity=`. Complexidade: **XS**.

**KLV-033 — `PATCH /api/marketplace/alerts/[id]`**
`UPDATE mp_alerts SET is_read = true WHERE id = $id AND user_id = $uid`. Complexidade: **XS**.

---

### 2.6 Back-end — Cron Jobs

---

#### KLV-034 — `/api/cron/mp-rank-tracker`

**Área:** Backend + DevOps
**Prioridade:** P0 — Crítico
**Complexidade:** L (5 pts)
**Dependências:** KLV-017, KLV-019, KLV-021, KLV-024

**Descrição técnica:**
Executa diariamente às 07h00. Fluxo:
1. `requireCronAuth()`
2. Buscar todos os `mp_listings` ativos com `keywords` não vazio
3. Para cada listing, chamar `analyzeRankForListing()`
4. Salvar novos registros em `mp_rank_history` (upsert por `UNIQUE` constraint)
5. Para cada delta, chamar `processAlerts()`
6. `logEvent('cron_mp_rank_tracker_completed', { listings_checked, alerts_generated }, 'info')`

Respeitar rate limit da ML API: máximo 10 requests/segundo. Usar `Promise.allSettled` com batches de 10.

**Arquivos afetados:**
- `app/api/cron/mp-rank-tracker/route.ts` — **criar**

**Critérios de aceitação:**
- [ ] Executa sem erro para 0, 1 e N listings
- [ ] `mp_rank_history` inserido para cada (listing, keyword) com data de hoje
- [ ] Alerta `critical` disparado quando queda > 5 posições
- [ ] Cron completa em < 30s para até 50 listings
- [ ] `system_events` registra resultado da execução

---

#### KLV-035 — `/api/cron/mp-qa-monitor`

**Área:** Backend + DevOps
**Prioridade:** P1 — Alto
**Complexidade:** M (3 pts)
**Dependências:** KLV-017, KLV-019, KLV-022, KLV-024

**Descrição técnica:**
Executa diariamente às 08h00. Para cada listing ativo:
1. Buscar perguntas novas desde `last_analyzed_at` (ou últimas 24h se nunca analisado)
2. Se `novas_perguntas >= 3`: chamar `analyzeQA()` → salvar em `mp_qa_intelligence` → processar alertas
3. Se `novas_perguntas < 3`: skip (não chama Claude, economiza custo)

**Arquivos afetados:**
- `app/api/cron/mp-qa-monitor/route.ts` — **criar**

---

#### KLV-036 — `/api/cron/mp-catalog-triage`

**Área:** Backend + DevOps
**Prioridade:** P1 — Alto
**Complexidade:** M (3 pts)
**Dependências:** KLV-017, KLV-023

**Descrição técnica:**
Executa semanalmente às segundas-feiras, 09h00. Para cada conta ativa com plano `mp_seller` ou `mp_agency`:
1. Chamar `runCatalogTriage(accountId)`
2. Salvar resultado em `mp_catalog_triages`
3. Inserir em `email_queue` o template `mp_weekly_catalog_report` com os 5 listings mais críticos

**Arquivos afetados:**
- `app/api/cron/mp-catalog-triage/route.ts` — **criar**

---

### 2.7 Front-end — Páginas

---

#### KLV-037 — `/marketplace` — Hub Dashboard

**Área:** Frontend
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** KLV-032, KLV-027

**Descrição técnica:**
Página inicial do módulo. Exibir:
- **Alertas não lidos:** badge com contagem, lista dos 3 mais recentes com CTA
- **SKUs críticos:** top 3 listings com menor score (ou maior delta negativo de rank)
- **Stats rápidos:** total de SKUs monitorados, última triage, plataformas conectadas
- **CTA primário:** "Conectar conta" se nenhuma conta conectada; "Analisar catálogo" se contas existem

Estado vazio: se nenhuma `mp_accounts` existe, exibir onboarding step-by-step: Conectar → Selecionar SKUs → Primeira análise.

**Arquivos afetados:**
- `app/marketplace/page.tsx` — **criar**
- `components/marketplace/AlertBadge.tsx` — **criar**
- `components/marketplace/CriticalSkuCard.tsx` — **criar**

---

#### KLV-038 — `/marketplace/connect` — Conectar Conta

**Área:** Frontend
**Prioridade:** P0 — Crítico
**Complexidade:** M (3 pts)
**Dependências:** KLV-026

**Descrição técnica:**
Dois cards: Mercado Livre e Shopee.

**Mercado Livre:** botão "Conectar com Mercado Livre" → redireciona para URL OAuth ML:
```
https://auth.mercadolivre.com.br/authorization?response_type=code
  &client_id={ML_APP_ID}&redirect_uri={ML_REDIRECT_URI}
```

**Shopee:** input de URL do perfil do vendedor + botão "Adicionar".

Lista de contas já conectadas com status e botão "Desconectar".

**Arquivos afetados:**
- `app/marketplace/connect/page.tsx` — **criar**
- `app/marketplace/callback/page.tsx` — **criar** (recebe `?code=` do OAuth ML e chama `/api/marketplace/connect`)

---

#### KLV-039 — `/marketplace/catalog` — Catalog Triage Table

**Área:** Frontend
**Prioridade:** P0 — Crítico
**Complexidade:** L (5 pts)
**Dependências:** KLV-027, KLV-030

**Descrição técnica:**
Tabela com colunas: Plataforma (ícone ML/Shopee), Título (truncado, link para `/marketplace/listings/[id]`), Score (badge colorido), Benchmark da categoria, Gap (score atual - benchmark, vermelho se negativo), Última análise (data relativa), Ações (botão "Analisar").

Controles: botão "Analisar catálogo completo" (dispara `POST /api/marketplace/triage`), filtro por plataforma, ordenação por score/gap/data.

Loading state com skeleton durante fetch. Estado vazio com CTA de adicionar primeiro SKU.

**Arquivos afetados:**
- `app/marketplace/catalog/page.tsx` — **criar**
- `components/marketplace/CatalogTable.tsx` — **criar**
- `components/marketplace/ScoreBadge.tsx` — **criar** (reutilizável)

---

#### KLV-040 — `/marketplace/listings/[id]` — SKU Detail

**Área:** Frontend
**Prioridade:** P1 — Alto
**Complexidade:** L (5 pts)
**Dependências:** KLV-029, KLV-031

**Descrição técnica:**
Página em abas:
1. **Diagnóstico:** 6 dimensões com score individual, issues identificados, quick wins priorizados
2. **Histórico:** gráfico de linha com score ao longo do tempo (últimos 90 dias)
3. **Ranking:** tabela de keywords com posição atual, posição anterior, delta (seta colorida)
4. **Q&A Intelligence:** lista de perguntas não respondidas com texto sugerido para descrição, botão "Copiar sugestão"
5. **Alertas recentes:** 5 últimos alertas do listing com timestamp

Header com: título do anúncio, URL, plataforma, score atual (grande), botão "Re-analisar".

**Arquivos afetados:**
- `app/marketplace/listings/[id]/page.tsx` — **criar**
- `components/marketplace/ListingDimensions.tsx` — **criar**
- `components/marketplace/RankTable.tsx` — **criar**
- `components/marketplace/QAGapList.tsx` — **criar**

---

#### KLV-041 — `/marketplace/ranks` — Rank Tracker Dashboard

**Área:** Frontend
**Prioridade:** P2 — Médio
**Complexidade:** M (3 pts)
**Dependências:** KLV-031

**Descrição técnica:**
Gráfico de linha (Recharts ou Chart.js) com posição ao longo do tempo, uma linha por keyword. Y-axis invertido (posição 1 no topo). Filtros: listing, keyword, período (7d / 30d / 90d). Tabela abaixo do gráfico com dados brutos.

**Arquivos afetados:**
- `app/marketplace/ranks/page.tsx` — **criar**
- `components/marketplace/RankChart.tsx` — **criar**

---

#### KLV-042 — `/marketplace/alerts` — Alert Feed

**Área:** Frontend
**Prioridade:** P1 — Alto
**Complexidade:** S (2 pts)
**Dependências:** KLV-032, KLV-033

**Descrição técnica:**
Lista cronológica de alertas com: ícone por severidade (🔴 critical / 🟡 warning / 🟢 info), título do listing, descrição do alerta, timestamp relativo, botão "Ver listing" e botão "Marcar como lido". Filtros por tipo e severidade. Botão "Marcar todos como lidos".

**Arquivos afetados:**
- `app/marketplace/alerts/page.tsx` — **criar**
- `components/marketplace/AlertItem.tsx` — **criar**

---

## Parte III — Ordem de Implementação Recomendada

### Sprint 1 — Fundação do Produto Existente (Semana 1–2)
*Objetivo: estabilizar o produto atual antes de adicionar complexidade.*

| # | Issue | Complexidade | Razão |
|---|-------|-------------|-------|
| 1 | KLV-004 — Fix email síncrono | XS | Menor esforço, risco real de falha em produção |
| 2 | KLV-005 — Auth guard dashboard | S | Segurança — deve estar em produção agora |
| 3 | KLV-001 — Cron renovação free | S | Elimina churn silencioso do plano free |
| 4 | KLV-011 — Flag conteúdo truncado | XS | XS de esforço, elimina laudos enganosos |
| 5 | KLV-003 — URL persistente do laudo | M | Habilita KLV-002 |
| 6 | KLV-002 — Histórico de laudos | M | Depende de KLV-003 |

---

### Sprint 2 — Conversão e Retenção (Semana 3–4)
*Objetivo: fechar furos no funil de monetização.*

| # | Issue | Complexidade | Razão |
|---|-------|-------------|-------|
| 7 | KLV-006 — Paywall sem fricção | S | Impacto direto em conversão free→pro |
| 8 | KLV-007 — /sucesso trial vs pago | S | Expectativa correta do usuário |
| 9 | KLV-009 — /plano com dados reais | M | Reduz tickets de suporte |
| 10 | KLV-008 — Templates churn recovery | M | A sequência mais valiosa de retenção |
| 11 | KLV-012 — Posthog analytics | M | Necessário para medir o impacto dos sprints anteriores |

---

### Sprint 3 — Infraestrutura do Marketplace (Semana 5–6)
*Objetivo: base técnica para o novo módulo — banco, env, serviços externos.*

| # | Issue | Complexidade | Razão |
|---|-------|-------------|-------|
| 12 | KLV-013 — Env vars marketplace | XS | Bloqueador de tudo |
| 13 | KLV-015 — Stripe novos preços | XS | Bloqueador de billing marketplace |
| 14 | KLV-017 — Migration SQL 7 tabelas | M | Bloqueador de back-end |
| 15 | KLV-018 — RPCs Supabase | S | Depende de KLV-017 |
| 16 | KLV-019 — lib/ml-api.ts | S | Bloqueador das rotas de API |
| 17 | KLV-025 — Prompts Claude | M | Bloqueador da análise |
| 18 | KLV-014 — Vercel crons | XS | Depende de rotas de cron (sprint 4) |

---

### Sprint 4 — Back-end Core do Marketplace (Semana 7–8)
*Objetivo: rotas de API funcionais, análise completa de um SKU.*

| # | Issue | Complexidade | Razão |
|---|-------|-------------|-------|
| 19 | KLV-026 — POST /connect | M | Onboarding do seller |
| 20 | KLV-027 — GET/POST /listings | S | |
| 21 | KLV-029 — POST /analyze/[id] | L | Core do produto |
| 22 | KLV-024 — alert-engine.ts | M | Necessário para crons |
| 23 | KLV-034 — Cron rank-tracker | L | |
| 24 | KLV-021 — rank-analyzer.ts | S | Depende de KLV-019 |

---

### Sprint 5 — Front-end Marketplace (Semana 9–10)
*Objetivo: interface completa para o seller.*

| # | Issue | Complexidade | Razão |
|---|-------|-------------|-------|
| 25 | KLV-038 — /marketplace/connect | M | Ponto de entrada |
| 26 | KLV-037 — /marketplace hub | M | Dashboard principal |
| 27 | KLV-039 — /marketplace/catalog | L | Triage table |
| 28 | KLV-040 — /marketplace/listings/[id] | L | Deep-dive |
| 29 | KLV-042 — /marketplace/alerts | S | Feed de alertas |

---

### Sprint 6 — Intelligence Layer + Polish (Semana 11–12)
*Objetivo: camada de inteligência contínua e polish do produto existente.*

| # | Issue | Complexidade |
|---|-------|-------------|
| 30 | KLV-022 — qa-analyzer.ts | M |
| 31 | KLV-035 — Cron mp-qa-monitor | M |
| 32 | KLV-023 — catalog-scorer.ts | M |
| 33 | KLV-036 — Cron mp-catalog-triage | M |
| 34 | KLV-016 — Templates Resend marketplace | M |
| 35 | KLV-041 — /marketplace/ranks | M |
| 36 | KLV-010 — Social proof landing | M |
| 37 | KLV-028, KLV-030–033 — Rotas auxiliares | XS-S cada |

---

## Apêndice — Mapa de Dependências Críticas

```
KLV-017 (migration SQL)
  └── KLV-018 (RPCs)
  └── KLV-026 (POST /connect)
  └── KLV-027 (GET/POST /listings)
  └── KLV-029 (POST /analyze)
  └── KLV-034 (cron rank-tracker)
  └── KLV-035 (cron qa-monitor)
  └── KLV-036 (cron catalog-triage)

KLV-019 (ml-api.ts)
  └── KLV-021 (rank-analyzer.ts)
  └── KLV-022 (qa-analyzer.ts)
  └── KLV-023 (catalog-scorer.ts)
  └── KLV-029 (POST /analyze)

KLV-025 (Claude prompts)
  └── KLV-029 (POST /analyze)
  └── KLV-022 (qa-analyzer.ts)

KLV-003 (URL persistente do laudo)
  └── KLV-002 (histórico de laudos)

KLV-013 (env vars)
  └── KLV-014 (vercel.json crons)
  └── KLV-015 (Stripe preços)
  └── KLV-026 (POST /connect — ML OAuth)

KLV-034 (cron rank-tracker)
  └── KLV-014 (vercel.json) — deve estar registrado antes do deploy
```

**Caminho crítico para primeira análise de marketplace funcional:**
`KLV-013 → KLV-017 → KLV-018 → KLV-019 → KLV-025 → KLV-029`

**Caminho crítico para onboarding completo do seller:**
`KLV-015 → KLV-026 → KLV-027 → KLV-029 → KLV-038 → KLV-037`

---

*Documento vivo — atualizar após cada sprint com status de implementação.*
*Versão 1.0 — Mai/2026*
