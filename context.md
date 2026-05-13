# Klarivy — Contexto do Projeto

> **Documento de verdade único.** Tudo que qualquer agente, desenvolvedor ou colaborador
> precisa saber para trabalhar no produto está aqui. Mantenha sempre atualizado.

---

## 1. Identidade do produto

### Marca e nomenclatura

| Termo | Papel | Uso correto |
|---|---|---|
| **Klarivy** | Nome do produto e da marca | Interface, domínio, emails, comunicação |
| **NeuroConvert** | Nome da metodologia científica | Referências técnicas, landing page, laudos |

**Hierarquia:** Klarivy é a empresa e o produto. NeuroConvert é a metodologia que alimenta a engine de análise do produto — como um framework interno com nome próprio.

**Exemplo correto:** "A Klarivy usa a metodologia NeuroConvert para analisar páginas."  
**Exemplo errado:** "Bem-vindo ao NeuroConvert" (quando falando do produto/login/emails).

### Domínio e URLs

| Ambiente | URL |
|---|---|
| Produção | `https://www.klarivy.com` |
| Email from | `noreply@klarivy.com` |
| Suporte | `team@klarivy.com` |

### O que é o produto

SaaS B2B de otimização de conversão com neuromarketing. O usuário cola uma URL, a IA analisa
a página usando princípios de neurociência comportamental (metodologia NeuroConvert) e entrega
um **laudo** com score 0–100, análise em 5 dimensões e 3 quick wins acionáveis.

**Metáfora central:** o produto se comporta como um laudo médico — diagnóstico clínico,
terminologia precisa, findings por severidade. Não é ferramenta de feedback genérico.

---

## 2. Modelo de negócio

### Planos e preços

| Plano | Preço | Laudos | Observações |
|---|---|---|---|
| **Free** | R$ 0 | 1 laudo/mês | Renova no 1º dia de cada mês — PLG, ciclo de retenção |
| **Pro** | R$ 297/mês | 10 laudos/ciclo | Créditos renovam a cada fatura paga (não por mês civil) |
| **Agency** | Sob consulta | Ilimitado + white-label | Contrato manual; plano `agency` no banco |

> **Decisão de produto — Free:** o plano Free dá **1 laudo por mês** (não vitalício).
> O crédito mensal free renova no dia 1 de cada mês via cron.
> Custo marginal por análise: ~R$ 0,12. Justificativa: ciclo de retenção mensal é
> fundamental para PLG; sem renovação o usuário não tem motivo para voltar antes de pagar.

### Métricas financeiras

```
MRR       = (assinantes_pro × 297) + (assinantes_agency × 997)
ARR       = MRR × 12
Churn     = cancelamentos / assinantes_início × 100
LTV       = ARPU / churn_mensal
NRR       = (MRR + expansão − churn) / MRR_início × 100
Break-even = 6 assinantes Pro (custo fixo ~R$ 1.500, margem 88%)
Custo/análise  = ~R$ 0,12 (Claude API + Firecrawl)
Receita/análise Pro = R$ 29,70 → margem ~90%
```

Alvos: churn < 3% · NRR > 110% · LTV/CAC > 5

### Operação

1 pessoa (founder). Prioridade: simplicidade, confiabilidade, menor custo de manutenção.

---

## 3. Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Estilo | Tailwind CSS + design system Klarivy |
| IA | Claude API — `claude-sonnet-4-20250514` |
| Scraping | Firecrawl (`@mendable/firecrawl-js`) |
| Pagamentos | Stripe (BRL, assinaturas recorrentes) |
| Banco | Supabase (PostgreSQL + Auth + RLS) |
| Email | Resend |
| Hosting | Vercel + cron jobs nativos |
| Observabilidade | `system_events` via `logEvent()` |

---

## 4. Estrutura de pastas

```
/app
  page.tsx               → landing (LandingPage.tsx)
  /analise               → fluxo URL → laudo → paywall (AnalyzeClient.tsx)
  /sucesso               → pós-Stripe Checkout
  /dashboard
    layout.tsx           → shell do dashboard (DashboardShell)
    page.tsx             → home do dashboard (KPIs, histórico)
    /laudos              → listagem de laudos históricos
    /laudos/[id]         → laudo individual (rota futura — ver issues)
    /nova                → nova análise dentro do dashboard
    /plano               → status do plano + créditos + upgrade
  /conta
    /criar               → signup com email/senha
    /entrar              → login com email/senha
  /maintenance           → página de manutenção (MAINTENANCE_MODE=true)
  /api
    /analyze             → scraping + Claude → laudo JSON  ← coração do produto
    /checkout            → sessão Stripe Checkout
    /webhook             → eventos Stripe (idempotente)
    /health              → health check de dependências
    /cron
      /email-queue       → processa email_queue (cron diário)
      /daily-snapshot    → métricas diárias + relatório semanal admin
      /usage-monitor     → alertas de uso de serviços
/lib
  stripe.ts              → getStripe()
  email.ts               → sendEmail() — sempre via email_queue, nunca síncrono em webhooks
  email-delivery.ts      → processador da fila (usado pelo cron)
  monitoring.ts          → logEvent() → tabela system_events
  report-json.ts         → parseNeuroReportFromModelText()
  cron-auth.ts           → requireCronAuth()
  /supabase
    admin.ts             → createServiceClient() — service role, só servidor
    browser.ts           → getBrowserSupabase() — anon key, cliente
/schemas
  analyze-request.ts     → Zod schema para POST /api/analyze
  checkout-request.ts    → Zod schema para POST /api/checkout
/middleware.ts           → maintenance mode + proteção de rotas (ver issues)
/vercel.json             → cron jobs
```

---

## 5. Banco de dados

### Tabelas

```sql
users            -- id, email, stripe_customer_id, stripe_subscription_id,
                 -- plan (free|pro|agency), credits_remaining, subscription_status,
                 -- subscribed_at, created_at

reports          -- id, user_id, url, sector, score, report_json (JSONB),
                 -- scraping_ok, latency_ms, created_at

financial_events -- type (subscription_created|canceled), plan, mrr_impact,
                 -- stripe_event_id (UNIQUE — idempotência)

revenue_log      -- amount, currency, stripe_invoice_id (UNIQUE), paid_at

email_queue      -- to_email, template, data (JSONB), status, send_at, sent_at, created_at

system_events    -- event, data, severity (info|warning|error|critical), created_at

daily_metrics    -- date PK, mrr, new_subscribers, churned_subscribers,
                 -- total_active_subscribers, total_analyses, free_to_paid_conversions,
                 -- api_error_rate, avg_latency_ms
```

### RPC principal

`complete_analysis(p_user_id, p_url, p_sector, p_score, p_report_json, p_scraping_ok, p_latency_ms)`
→ salva o laudo e decrementa crédito atomicamente em uma única transação SQL.

---

## 6. Variáveis de ambiente

```env
# IA
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514   # opcional; default no código

# Scraping
FIRECRAWL_API_KEY=fc-...

# Pagamentos
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
# STRIPE_PRICE_AGENCY — opcional; checkout self-serve só Pro

# Banco
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # nunca expor no cliente

# Email
RESEND_API_KEY=re_...
RESEND_FROM=noreply@klarivy.com

# App
NEXT_PUBLIC_URL=https://www.klarivy.com

# Admin e operação
ADMIN_SECRET=senha-forte
ADMIN_EMAIL=seu@email.com
CRON_SECRET=idem-ou-diferente-de-ADMIN_SECRET

# Feature flags
ANALYZE_ALLOW_BODY_USER_ID=false          # true apenas em dev local (sem JWT)
MAINTENANCE_MODE=false                    # true ativa a página de manutenção
```

---

## 7. Padrões de código obrigatórios

### Rotas de API

```typescript
export async function POST(req: Request) {
  // 1. Validar configuração de ambiente
  // 2. Validar input (Zod)
  // 3. Autenticar / checar créditos
  // 4. Lógica de negócio
  // 5. Persistir no Supabase
  // 6. Efeitos colaterais (inserir em email_queue, logEvent)
  // 7. return Response.json()
}
```

### Emails — regra absoluta

```typescript
// ✅ CORRETO — sempre via fila, processada pelo cron
await supabase.from("email_queue").insert({
  to_email: user.email,
  template: "free_limit_reached",
  data: { score, url },
  status: "pending",
  send_at: new Date().toISOString(),
});

// ❌ ERRADO — nunca chamar sendEmail() diretamente dentro de webhook ou analyze
await sendEmail({ to: user.email, template: "free_limit_reached", data });
```

**Motivo:** se o Resend falhar, não deve derrubar o webhook Stripe nem a resposta de análise.
O cron processa a fila com retry. Emails síncronos são frágeis e aumentam latência.

### Supabase — sempre service role no servidor

```typescript
const supabase = createServiceClient(); // lib/supabase/admin.ts
```

Nunca usar a anon key em rotas de servidor que precisam de acesso irrestrito.

### Claude API — parsear resposta

```typescript
const block = response.content[0];
const text = block?.type === "text" ? block.text : "";
const report = parseNeuroReportFromModelText(text); // lib/report-json.ts
```

### Stripe — webhook deve responder em < 5s

```typescript
event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
// Nenhuma lógica pesada aqui — persistir e enfileirar, responder rápido
```

### TypeScript — sem `any`

Usar `unknown` com type guards. O compilador é aliado — não contorne.

---

## 8. Templates de email disponíveis

| Template | Gatilho | Status |
|---|---|---|
| `welcome_free` | Conta criada | ✅ Implementar |
| `free_limit_reached` | Usuário free sem créditos | ✅ Implementar |
| `welcome_paid` | Webhook `subscription.created` | ✅ Implementar |
| `payment_failed` | Webhook `invoice.payment_failed` | ✅ Implementar |
| `churn_recovery_d1` | D+1 após cancelamento | ⚠️ Criar no Resend |
| `churn_recovery_d3` | D+3 após cancelamento | ⚠️ Criar no Resend |
| `churn_recovery_d7` | D+7 após cancelamento (desconto) | ⚠️ Criar no Resend |
| `report_ready` | Laudo gerado (futuro — monitoramento) | 📋 Roadmap |
| `weekly_mrr_report` | Toda segunda, para o admin | ✅ Implementar |

**Atenção:** os templates `churn_recovery_d*` são agendados no banco pelo webhook mas os
HTMLs ainda precisam ser criados no painel Resend antes de entrarem em produção.

---

## 9. Fluxo completo do usuário (estado atual)

```
[Landing /]
  → Usuário cola URL no hero ou clica "Gerar laudo"
  → Se não logado: redirect para /conta/criar?redirect=/analise
  → Se logado: vai para /analise

[/conta/criar]
  → Supabase Auth signUp (email + senha)
  → Redirect automático para /analise (ou redirect param)
  ⚠️  Confirmar comportamento com email confirmation do Supabase ativo/desativo

[/analise]
  → Formulário: URL + setor + contexto adicional (opcional)
  → POST /api/analyze com Bearer token do Supabase Auth
  → 200: laudo exibido inline (score, 5 seções, 3 quick wins)
  → 402: paywall inline → formulário de checkout → POST /api/checkout → redirect Stripe
  → Stripe Checkout → /sucesso?session_id=...
  → Webhook Stripe ativa plano Pro e créditos assincronamente

[/dashboard]
  → Home: KPIs e ação rápida (parcialmente implementado)
  → /nova: AnalyzeClient sem back link
  → /laudos: listagem (placeholder — ver issues)
  → /plano: status do plano (placeholder — ver issues)
```

---

## 10. Jornada de monetização

```
Free user (1 crédito/mês)
  → Usa o laudo → vê valor
  → Mês seguinte: 1 novo crédito → volta
  → Bate no paywall (usa o crédito do mês) → paywall Pro
  → Pro: 10 laudos/mês, 7 dias de trial no Stripe, R$ 297/mês

Agency
  → Entrada por contato direto (team@klarivy.com)
  → Ativação manual: plan=agency, credits_remaining=9999 no banco
  → Opcionalmente: assinatura manual no Stripe com metadata plan=agency + userId
```

---

## 11. Thresholds de upgrade de infraestrutura

| Ferramenta | Agir quando | Próximo plano | Custo |
|---|---|---|---|
| Firecrawl | > 400 scrapes/mês | Hobby | US$ 16/mês |
| Vercel | > 80 GB bandwidth | Pro | US$ 20/mês |
| Supabase | > 450 MB storage | Pro | US$ 25/mês |
| Resend | > 2.400 emails/mês | Starter | US$ 20/mês |
| Claude API | > 80% do budget | Revisar prompt ou preço | Pay-per-use |

---

## 12. Regras de segurança

- Nunca logar chaves de API em `logEvent()` ou console
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no cliente
- Limitar conteúdo passado ao Claude: `pageContent.slice(0, 6000)`
- Validar todos os inputs com Zod antes de qualquer operação
- Nunca usar `any` no TypeScript — usar `unknown` com type guards
- `ANALYZE_ALLOW_BODY_USER_ID=false` em produção sempre

---

## 13. O que não fazer

- `any` no TypeScript
- Chamadas à Claude API sem error handling completo
- `sendEmail()` síncrono dentro de webhooks ou da rota `/api/analyze`
- `console.log` em produção — usar `logEvent()` de `/lib/monitoring.ts`
- Operações Supabase no cliente com service role key
- Resposta de webhook Stripe que demora mais de 5s
- Emails diretos dentro do handler de webhook (usar `email_queue`)

---

## 14. Prioridade máxima de confiabilidade

O endpoint `/api/analyze` nunca pode falhar silenciosamente.
É o coração do produto. Qualquer erro deve ser capturado, logado (`critical`) e visível em
`system_events`. Toda fricção no fluxo — especialmente no free — tem custo direto em conversão.

---

## 15. Issues conhecidos e status (backlog)

Esta seção documenta os problemas identificados no diagnóstico de produto (Mai/2026).
Cada issue tem severidade, área e status atual.

### 🔴 Críticos — bloqueia produto ou retenção

#### [ISS-01] Cron de renovação mensal do crédito free não existe
- **Área:** negócio / produto
- **Status:** ❌ Não implementado
- **Descrição:** O plano Free deve dar 1 laudo/mês (renovando no dia 1). Atualmente não há
  cron que execute essa renovação. Usuários free ficam sem crédito após o primeiro laudo
  para sempre — eliminando o ciclo de retenção PLG.
- **Fix:** criar `/api/cron/renew-free-credits` que executa no 1º de cada mês e faz
  `UPDATE users SET credits_remaining = 1 WHERE plan = 'free' AND credits_remaining = 0`.
  Adicionar entrada em `vercel.json` com schedule `0 6 1 * *`.

#### [ISS-02] Dashboard não exibe laudos históricos reais
- **Área:** produto / UX
- **Status:** ❌ Placeholder (hardcoded)
- **Descrição:** `/dashboard/laudos` exibe apenas texto estático. Usuários Pro que pagam
  R$ 297/mês não conseguem ver o histórico de laudos gerados. Os dados existem na tabela
  `reports` mas não são expostos na interface.
- **Fix:** implementar listagem em `/dashboard/laudos` com query
  `SELECT id, url, score, sector, created_at FROM reports WHERE user_id = $uid ORDER BY created_at DESC`.
  Adicionar rota `/dashboard/laudos/[id]` com o laudo completo renderizado.

#### [ISS-03] Laudo gerado não tem URL persistente — usuário perde ao fechar aba
- **Área:** UX / produto
- **Status:** ❌ Não implementado
- **Descrição:** O laudo fica em estado React local (`AnalyzeClient`). Se o usuário fechar
  a aba perde o resultado, mesmo o banco tendo os dados. Não há como revisitar, compartilhar
  ou comparar laudos.
- **Fix:** após análise bem-sucedida, redirecionar para `/dashboard/laudos/[report_id]`
  retornado pelo RPC `complete_analysis`. O `report_id` já existe na resposta da API.

#### [ISS-04] Email síncrono dentro de `/api/analyze` — viola regra de ouro
- **Área:** técnico
- **Status:** ❌ Bug (viola padrão do projeto)
- **Descrição:** Em `analyze/route.ts` há um `await sendEmail()` direto quando o usuário
  free usa o último crédito. O `context.md` e o padrão do projeto proíbem emails síncronos
  fora do cron. Isso aumenta latência da análise e pode causar falha em cascata.
- **Fix:** substituir por insert na `email_queue` com template `free_limit_reached`.

#### [ISS-05] `/dashboard` sem auth guard — qualquer pessoa acessa sem login
- **Área:** segurança / produto
- **Status:** ❌ Não protegido (comentado em middleware.ts como "VEN-9")
- **Descrição:** O middleware atual deixa `/admin` passar sem proteção real
  (`return NextResponse.next()`). O dashboard de usuário também não tem verificação
  de sessão server-side.
- **Fix:** no middleware, verificar cookie/token Supabase para rotas `/dashboard/*`
  e redirecionar para `/conta/entrar?redirect=...` se não autenticado. Para `/admin/*`,
  implementar verificação de `ADMIN_SECRET`.

---

### 🟡 Importantes — impacta conversão ou experiência

#### [ISS-06] Paywall com fricção desnecessária no fluxo de upgrade
- **Área:** UX / negócio
- **Status:** ⚠️ Funcional mas subótimo
- **Descrição:** (a) O campo de email do checkout precisa ser preenchido manualmente
  pelo usuário, mesmo ele estando logado e o email já estar disponível na session.
  (b) Após gerar o link do Stripe, aparece apenas como texto "Abrir Stripe Checkout"
  sem redirect automático — cada segundo de fricção reduz conversão.
- **Fix:** preencher email automaticamente de `session.user.email`. Após receber `url`
  do checkout, fazer `window.location.href = data.url` imediatamente em vez de exibir link.

#### [ISS-07] Página `/sucesso` diz "Pagamento recebido" durante trial de 7 dias
- **Área:** UX
- **Status:** ⚠️ Tecnicamente incorreto
- **Descrição:** O trial Stripe significa que nenhuma cobrança foi feita ainda, mas a
  página de sucesso diz "Pagamento recebido". Após conversão, o usuário vai para `/analise`
  em vez do dashboard — perdendo o momento de onboarding.
- **Fix:** distinguir trial de pagamento real via `session_id` + verificação no Stripe.
  Mensagem correta: "Plano Pro ativado — 7 dias grátis antes da primeira cobrança."
  Redirect pós-conversão: `/dashboard` com estado de boas-vindas.

#### [ISS-08] Templates churn recovery agendados no banco mas não existem no Resend
- **Área:** técnico / negócio
- **Status:** ⚠️ Risco silencioso
- **Descrição:** O webhook agenda `churn_recovery_d1`, `churn_recovery_d3` e
  `churn_recovery_d7` na `email_queue`. Se esses templates não existirem no Resend,
  a sequência de recovery mais valiosa do negócio falha silenciosamente (status `failed`
  na fila sem alerta).
- **Fix:** criar os 3 templates HTML no Resend. Adicionar log `critical` em
  `email-delivery.ts` quando template não for encontrado.

#### [ISS-09] `/dashboard/plano` não mostra créditos restantes nem status real
- **Área:** UX / produto
- **Status:** ⚠️ Placeholder
- **Descrição:** A página de gestão de plano exibe apenas texto estático com link para
  `/analise`. Usuários Pro precisam saber: créditos restantes, data de renovação, plano
  atual e opção de cancelamento.
- **Fix:** buscar `plan`, `credits_remaining`, `subscription_status`, `subscribed_at`
  da tabela `users` e renderizar na página. Adicionar link para portal do Stripe
  (`stripe.billingPortal.sessions.create`) para gestão de assinatura.

---

### 🔵 Médios — melhoria de produto ou analytics

#### [ISS-10] Landing sem prova social real
- **Área:** negócio / marketing
- **Status:** ⚠️ Apenas autoridade científica, sem evidência de uso real
- **Descrição:** A landing usa Cialdini, Kahneman e Nielsen Norman como âncoras de
  credibilidade, mas não tem casos de uso reais, depoimentos ou número de laudos gerados.
  O score demo é explicitamente "fictício". Para um produto que vende conversão, a própria
  landing precisa converter bem.
- **Ação:** obter 2–3 casos de uso beta com resultados mensuráveis. Exibir número total de
  laudos gerados (se relevante). Adicionar depoimento de 1 usuário real mesmo que simples.

#### [ISS-11] Conteúdo truncado em 6.000 chars — análises de páginas longas são parciais
- **Área:** produto / qualidade
- **Status:** ⚠️ Limitação conhecida não documentada
- **Descrição:** `content.slice(0, 6000)` corta páginas longas antes das seções de
  CTA, preços e formulário — justamente os elementos mais críticos para CRO. O usuário
  recebe um laudo que pode ignorar partes essenciais da página sem saber.
- **Ação:** testar com sales pages longas. Considerar aumentar para 10.000–12.000 chars.
  Adicionar flag `content_truncated: true` no laudo quando o conteúdo foi cortado, e
  avisar o usuário na interface.

#### [ISS-12] Sem product analytics — funil de conversão é caixa preta
- **Área:** negócio / produto
- **Status:** ❌ Não implementado
- **Descrição:** Não há tracking de produto (Posthog, Amplitude, etc.). O `system_events`
  captura eventos técnicos, mas não há funil: landing → signup → primeiro laudo →
  paywall → checkout → conversão. Sem isso, decisões de produto são baseadas em intuição.
- **Ação:** instalar Posthog (free até 1M eventos/mês). Instrumentar eventos críticos:
  `landing_viewed`, `signup_started`, `signup_completed`, `analyze_started`,
  `analyze_completed`, `paywall_hit`, `checkout_started`, `checkout_completed`.

---

## 16. Roadmap de produto (visão)

### MVP atual (funcional)
- [x] Análise de URL com Claude + Firecrawl
- [x] Laudo com score, 5 seções, 3 quick wins
- [x] Plano Free + Pro com Stripe
- [x] Webhook Stripe (criação, cancelamento, renovação, pagamento falho)
- [x] Churn recovery agendado na fila
- [x] Health check + observabilidade via system_events
- [x] Crons de snapshot diário e monitoramento de uso

### Próxima iteração (issues críticos — pré-aquisição)
- [ ] [ISS-01] Cron de renovação mensal de crédito free
- [ ] [ISS-02] Listagem de laudos históricos no dashboard
- [ ] [ISS-03] Rota de laudo individual `/dashboard/laudos/[id]`
- [ ] [ISS-04] Fix email síncrono em `/api/analyze`
- [ ] [ISS-05] Auth guard no dashboard e admin

### Iteração seguinte (conversão e retenção)
- [ ] [ISS-06] Paywall com redirect automático para Stripe
- [ ] [ISS-07] Página de sucesso diferenciando trial de pagamento
- [ ] [ISS-08] Templates churn recovery no Resend
- [ ] [ISS-09] Página de plano com dados reais + portal Stripe
- [ ] [ISS-12] Product analytics com Posthog

### Roadmap futuro
- [ ] Monitoramento automático mensal (re-análise agendada + email comparativo)
- [ ] Rota `/dashboard/laudos/[id]` compartilhável (link público com token)
- [ ] Comparação de laudos (antes/depois da implementação dos quick wins)
- [ ] API pública para integrações de agência
- [ ] White-label para plano Agency

---

## 17. Regra de ouro operacional

> O endpoint `/api/analyze` nunca pode falhar silenciosamente.
> É o coração do produto. Qualquer erro deve ser capturado, logado com `critical`
> e visível em `system_events`.
>
> Toda fricção no fluxo gratuito tem custo maior do que qualquer nova feature.
> Resolva os issues críticos antes de construir funcionalidades novas.
