# NeuroConvert — Contexto do Projeto

## Produto

SaaS B2B de otimização de conversão com neuromarketing. O usuário cola uma URL, a IA analisa a página usando princípios de neurociência comportamental e entrega um laudo com score 0–100, análise em 5 dimensões e 3 quick wins acionáveis.

**Modelo de negócio — freemium PLG:**

- Free: 1 análise/mês
- Pro: R$ 297/mês — 10 análises (Checkout Stripe na app)
- Agência: sob consulta — ilimitado + white-label (contrato manual; plano `agency` na BD / webhook se usares Stripe à parte)

**Operação:** 1 pessoa (founder). Priorizar simplicidade, confiabilidade e menor custo de manutenção.

---

## Stack

| Camada     | Tecnologia                              |
| ---------- | --------------------------------------- |
| Framework  | Next.js 14 App Router + TypeScript      |
| Estilo     | Tailwind CSS                            |
| IA         | Claude API — `claude-sonnet-4-20250514` |
| Scraping   | Firecrawl (`@mendable/firecrawl-js`)   |
| Pagamentos | Stripe (BRL, assinaturas recorrentes)   |
| Banco      | Supabase (PostgreSQL)                   |
| Email      | Resend                                  |
| Hosting    | Vercel + cron jobs nativos              |
| Observabilidade | `system_events` via `logEvent()`   |

---

## Estrutura de pastas

```
/app
  /api
    /analyze          → scraping + Claude → laudo JSON
    /checkout         → sessão Stripe Checkout
    /webhook          → eventos Stripe
    /health           → health check de dependências
    /admin
      /metrics        → dashboard financeiro (protegido)
      /projections    → projeções MRR S-curve (protegido)
    /cron
      /email-queue    → processa fila de emails (1x/hora)
      /daily-snapshot → snapshot métricas (3h da manhã)
      /usage-monitor  → alertas de upgrade (9h)
  /admin              → dashboard protegido por cookie
/lib
  /cron-auth.ts       → requireCronAuth() (CRON_SECRET / ADMIN_SECRET)
  /email.ts           → sendEmail() com templates
  /email-delivery.ts  → envio real via Resend (cron email-queue)
  /microeconomics.ts  → calcLTV(), calcNRR(), projectedMrrSCurve()
  /monitoring.ts      → logEvent()
/middleware.ts        → proteção da rota /admin
/vercel.json          → crons (Vercel)
```

---

## Banco de dados

```sql
users            -- id, email, stripe_customer_id, stripe_subscription_id,
                 -- plan (free|pro|agency), credits_remaining, subscription_status,
                 -- subscribed_at, created_at

reports          -- id, user_id, url, sector, score, report_json (JSONB),
                 -- scraping_ok, latency_ms, created_at

financial_events -- type (subscription_created|canceled), plan, mrr_impact,
                 -- stripe_event_id

revenue_log      -- amount, currency, stripe_invoice_id, paid_at

email_queue      -- to_email, template, data (JSONB), status, send_at, sent_at, created_at

system_events    -- event, data, severity (info|warning|error|critical)

daily_metrics    -- date PK, mrr, new_subscribers, churned_subscribers,
                 -- total_active_subscribers, total_analyses, free_to_paid_conversions,
                 -- api_error_rate, avg_latency_ms
```

---

## Variáveis de ambiente

```env
ANTHROPIC_API_KEY
FIRECRAWL_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO
# STRIPE_PRICE_AGENCY — opcional; não usado pelo checkout self-serve
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM
ADMIN_SECRET
ADMIN_EMAIL
NEXT_PUBLIC_URL
CRON_SECRET
```

---

## Padrões de código

### Rotas de API

```typescript
// Estrutura obrigatória em todas as rotas
export async function POST(req: Request) {
  // 1. Validar input
  // 2. Autenticar / checar créditos
  // 3. Lógica de negócio
  // 4. Persistir no Supabase
  // 5. Efeitos colaterais (email na fila, logEvent)
  // 6. return Response.json()
}
```

### Autenticação admin

```typescript
const auth = req.headers.get("authorization");
if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
  return new Response("Unauthorized", { status: 401 });
}
```

### Claude API — parsear resposta

````typescript
const text = response.content[0].type === "text" ? response.content[0].text : "";
const report = JSON.parse(text.replace(/```json\n?|```/g, "").trim());
````

### Supabase — sempre service role em servidor

```typescript
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
```

### Emails — nunca síncronos em webhooks

Sempre inserir na `email_queue`. O cron processa a cada hora. Isso impede que falha no email derrube o webhook do Stripe.

### Stripe — webhook

```typescript
event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

Responder em menos de 5 segundos. Nenhuma lógica pesada dentro do handler.

---

## Métricas financeiras

```
MRR       = (pro × 297) + (agency × 997)
Churn     = cancelamentos / assinantes_início × 100
LTV       = ARPU / churn_mensal
NRR       = (MRR + expansão - churn) / MRR_início × 100
Break-even = 6 assinantes Pro (custo fixo ~R$1.500, margem 88%)
Custo/análise = ~R$ 0.12 (Claude API + Firecrawl)
Receita/análise Pro = R$ 29.70 → margem ~90%
```

Alvos: churn < 3% · NRR > 110% · LTV/CAC > 5

---

## Thresholds de upgrade de ferramentas

| Ferramenta | Agir quando                               |
| ---------- | ----------------------------------------- |
| Firecrawl  | > 400 scrapes/mês → Hobby US$ 16/mês      |
| Vercel     | > 80 GB bandwidth → Pro US$ 20/mês        |
| Supabase   | > 450 MB storage → Pro US$ 25/mês         |
| Resend     | > 2.400 emails/mês → Starter US$ 20/mês   |
| Claude API | > 80% do budget → revisar prompt ou preço |

---

## Regras de segurança

- Nunca logar chaves de API
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no cliente
- Limitar conteúdo passado ao Claude: `pageContent.slice(0, 6000)`
- Validar todos os inputs antes de enviar à IA
- Nunca usar `any` no TypeScript — usar `unknown` com type guards

---

## O que não fazer

- `any` no TypeScript
- Chamadas à Claude API sem error handling
- Emails síncronos dentro de webhooks
- `console.log` em produção — usar `logEvent()` de `/lib/monitoring.ts`
- Operações Supabase no cliente com service role key
- Resposta de webhook Stripe que demora mais de 5s

---

## Prioridade máxima

O endpoint `/api/analyze` nunca pode falhar silenciosamente.
É o coração do produto. Qualquer erro deve ser capturado, logado e alertado no Slack.
Toda fricção no fluxo gratuito tem custo maior que qualquer nova feature.
