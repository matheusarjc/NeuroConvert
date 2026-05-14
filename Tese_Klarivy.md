# Klarivy — Plataforma de Inteligência de Conversão para o Mercado de Língua Portuguesa

**White Paper — Versão 1.0**
**Data:** Maio de 2026
**Classificação:** Confidencial — Uso Interno e Investidores

---

## Abstract

O mercado digital brasileiro acumula uma lacuna estrutural entre o investimento em geração de tráfego e a capacidade diagnóstica aplicada à otimização de conversão. Empresas de e-commerce, SaaS e operadores de marketplace alocam volumes crescentes em mídia paga sem dispor de instrumentos técnicos acessíveis para identificar os bloqueios psicológicos e estruturais que impedem a conversão do visitante em cliente. A Klarivy é uma plataforma B2B SaaS que resolve essa lacuna por meio da metodologia proprietária NeuroConvert — um sistema de análise multidimensional que combina processamento de linguagem natural via Claude API, coleta automatizada de conteúdo digital via Firecrawl e um banco de dados de benchmarks acumulado de forma proprietária. O produto é estruturado em dois módulos: o Landing Page Analyzer, voltado à análise e monitoramento contínuo de páginas de destino, e o Marketplace Intelligence Module, destinado à otimização de anúncios em Mercado Livre e Shopee BR. Com custo marginal de R$0,12 por análise e margem bruta projetada entre 88% e 90%, a Klarivy opera em um mercado endereçável que supera R$4 bilhões em ARR potencial no Brasil. As projeções financeiras indicam break-even operacional com seis assinantes Pro (R$247/mês) e MRR de R$250 mil ao final de 24 meses de operação escalada. Este documento apresenta a arquitetura técnica, o modelo econômico, a análise competitiva e a tese de investimento da plataforma.

---

## 1. Sumário Executivo

A Klarivy é uma plataforma de inteligência de conversão B2B SaaS desenvolvida para o mercado de língua portuguesa, com foco inicial no Brasil. Sua proposta central é transformar o diagnóstico de barreiras psicológicas e estruturais à conversão — historicamente reservado a consultorias especializadas de alto custo — em um produto automatizado, recorrente e escalável. A plataforma opera por meio da metodologia NeuroConvert, que combina coleta automatizada de conteúdo digital, análise multidimensional via modelos de linguagem de grande escala (LLMs) e um banco de dados proprietário de benchmarks setoriais. O produto entrega laudos técnicos estruturados ("laudos") como ponto de entrada, e evolui para monitoramento contínuo de páginas e anúncios como mecanismo principal de retenção e expansão de receita.

A oportunidade financeira é fundamentada em três vetores. Primeiro, o mercado endereçável inclui aproximadamente 80 mil agências digitais, 150 mil e-commerces com faturamento superior a R$30 mil mensais, 200 mil gestores de performance e 3,5 milhões de vendedores ativos em marketplaces no Brasil. Um cenário conservador de penetração de 20 mil contas pagantes a ticket médio de R$200 mensais projeta ARR de R$48 milhões, com múltiplo de valuation de 8x ARR implicando R$384 milhões (aproximadamente US$65 milhões). Segundo, o custo marginal por análise de R$0,12 — composto por consumo de Claude API e Firecrawl — sustenta margens brutas entre 88% e 90%, com estrutura de custos fixos mínima e break-even operacional atingível com apenas seis assinantes no plano Pro. Terceiro, as projeções de MRR indicam R$15 mil ao final do sexto mês, R$60 mil ao final do décimo segundo mês e R$250 mil ao final do vigésimo quarto mês.

O moat competitivo da Klarivy é construído sobre três vantagens estruturais complementares. O banco de dados proprietário de benchmarks — alimentado por cada análise realizada na plataforma — cria um efeito de rede de dados que aumenta a precisão diagnóstica de forma proporcional ao volume de análises acumuladas, tornando o produto progressivamente mais difícil de replicar por novos entrantes. A especialização no mercado de língua portuguesa, com treinamento de prompts específicos para contexto cultural, semântico e de plataforma (Mercado Livre, Shopee BR), representa uma barreira que players globais como Hotjar, Semrush, Jungle Scout e Helium10 não conseguem transpor por simples tradução de produto. E o lock-in operacional, decorrente do acúmulo de histórico de scores e correlações de conversão dentro da plataforma, eleva o custo de migração do cliente a um patamar que inibe churn voluntário mesmo na ausência de cláusulas contratuais de fidelidade.

---

## 2. Declaração do Problema

### 2.1 A Lacuna de Diagnóstico no Ecossistema Digital Brasileiro

O ecossistema digital brasileiro é marcado por uma assimetria profunda entre a sofisticação das ferramentas de geração de tráfego e a precaledade dos instrumentos de diagnóstico de conversão. Gestores de performance alocam orçamentos de R$10 mil a R$500 mil mensais em campanhas de mídia paga com capacidade granular de otimização por segmento, criativo, horário e leilão — e entregam esse tráfego qualificado a landing pages e anúncios que nunca foram submetidos a análise psicológica ou estrutural rigorosa. O resultado é um desperdício sistemático de capital: segundo dados de benchmarking setorial, a taxa de conversão média de e-commerces brasileiros oscila entre 1,0% e 1,5%, enquanto operadores com práticas ativas de CRO (Conversion Rate Optimization) sustentam taxas entre 2,5% e 4,0%. A diferença de 1,5 ponto percentual em uma operação com 100 mil visitas mensais representa 1.500 vendas adicionais por mês — sem incremento de custo de aquisição.

A lacuna não é de dados. O Google Analytics 4, o Meta Ads Manager e plataformas como Hotjar fornecem volumes crescentes de dados comportamentais: taxas de rejeição, mapas de calor, gravações de sessão, funis de conversão. O problema é que esses dados descrevem o comportamento do usuário, mas não diagnosticam a causa subjacente. Saber que 78% dos visitantes abandonam a página acima do CTA não indica se o abandono é causado por carga cognitiva excessiva, ausência de prova social, ancoragem de preço inadequada, falha de urgência ou desalinhamento entre a promessa do anúncio e o conteúdo da página. Identificar a causa correta requer análise psicológica e estrutural que, até o surgimento de LLMs de alta capacidade, estava disponível apenas por meio de consultores especializados de CRO, a custos entre R$3 mil e R$15 mil por engajamento.

### 2.2 Intensidade e Frequência da Dor

A dor de conversão inadequada é simultaneamente intensa e permanente. Intensa porque cada ponto percentual de conversão não recuperado representa perda financeira direta e mensurável: um e-commerce com faturamento de R$200 mil mensais e taxa de conversão de 1,2% que atinge 1,8% incrementa receita em R$100 mil mensais sem incremento de tráfego. Permanente porque páginas e anúncios estão em estado contínuo de degradação competitiva — concorrentes lançam novos anúncios, consumidores evoluem suas expectativas e plataformas alteram algoritmos de relevância, tornando qualquer análise pontual obsoleta em semanas.

Os perfis de cliente que experimentam essa dor com intensidade financeira suficiente para justificar gasto mensal em ferramentas incluem: (a) e-commerces com faturamento entre R$50 mil e R$500 mil mensais, para os quais cada décimo de ponto percentual de conversão representa valor imediato; (b) agências digitais com dez ou mais clientes, que necessitam de instrumentos de diagnóstico escaláveis para provar valor recorrente em seus contratos de retenção; (c) gestores de tráfego pago, para quem a performance da landing page é determinante do ROI das campanhas gerenciadas e, portanto, da saúde do próprio negócio; (d) operadores de marketplace com catálogos ativos no Mercado Livre e Shopee BR, para os quais a qualidade do anúncio é o único fator de diferenciação controlável em um ambiente de paridade de preço.

### 2.3 Inadequação das Soluções Existentes

As alternativas disponíveis no mercado são inadequadas isoladamente para resolver o problema de diagnóstico de conversão no contexto brasileiro. A tabela a seguir sintetiza as limitações estruturais de cada categoria de solução:

| Solução | Proposta de Valor | Por que é inadequada como solução standalone |
|---|---|---|
| **Hotjar** | Mapas de calor, gravações de sessão, pesquisas de UX | Descreve comportamento, não diagnostica causa psicológica. Requer analista qualificado para interpretar dados. Não entrega prescrição — apenas observação. |
| **Semrush** | SEO, análise de palavras-chave, auditoria técnica | Focado em tráfego orgânico, não em conversão. Não analisa eficácia persuasiva de conteúdo, estrutura de oferta ou prova social. |
| **Consultor freelancer de CRO** | Análise especializada, recomendações customizadas | Custo entre R$2k e R$15k por engajamento. Não escalável para múltiplas páginas. Não disponível de forma recorrente no ticket mensal viável. Sem padronização de metodologia ou benchmarks. |
| **ChatGPT / Claude (uso direto)** | Análise de texto por LLM via prompt ad hoc | Sem metodologia estruturada, sem contexto de benchmark setorial, sem histórico de scores, sem automatização de coleta de conteúdo. Requer expertise do usuário para formular prompts eficazes. Entrega análise sem consistência ou comparabilidade. |
| **Jungle Scout / Helium10** | Inteligência de marketplace para Amazon | Desenvolvidos exclusivamente para Amazon US. Algoritmos, semântica e padrões de comportamento de Mercado Livre e Shopee BR não são cobertos. Sem versão em português. Sem contexto cultural brasileiro. |
| **Klarivy** | Diagnóstico multidimensional + monitoramento contínuo + benchmark setorial em PT-BR | Combina coleta automatizada (Firecrawl), análise LLM com metodologia estruturada (NeuroConvert), banco de dados de benchmarks proprietário e entrega de laudo acionável com score comparável ao longo do tempo. |

A Klarivy não compete diretamente com nenhuma dessas soluções em sua proposta central — ela preenche o espaço entre dados brutos de comportamento e diagnóstico psicológico acionável, com infraestrutura automatizada e custo mensal acessível.

---

## 3. Análise de Mercado

### 3.1 Mercado Endereçável (TAM/SAM/SOM)

O Mercado Total Endereçável (TAM) da Klarivy é composto pelo conjunto de operadores digitais brasileiros que possuem ativos de conversão — páginas e anúncios — com tráfego suficiente para que a otimização de conversão produza impacto financeiro mensurável. Estimativas baseadas em dados setoriais de 2025 indicam os seguintes segmentos:

- Agências digitais registradas no Brasil: aproximadamente 80.000, das quais estima-se que 5.000 a 8.000 possuam faturamento e base de clientes compatíveis com ferramentas de análise recorrente.
- E-commerces com faturamento superior a R$30 mil mensais: aproximadamente 150.000 operadores, segundo dados da Associação Brasileira de Comércio Eletrônico.
- Gestores e profissionais de performance marketing: aproximadamente 200.000 profissionais ativos, incluindo autônomos e equipes internas.
- Vendedores ativos em marketplaces (Mercado Livre, Shopee BR, Amazon BR): aproximadamente 3,5 milhões, dos quais estima-se que 300 mil a 500 mil operem com faturamento mensal superior a R$20 mil e possam ser qualificados como compradores de ferramentas de inteligência.

O Mercado Endereçável Disponível (SAM), delimitado pelos segmentos com maior probabilidade de adoção no horizonte de 24 meses, é estimado em 50.000 contas potenciais. Aplicando um ticket médio mensal ponderado de R$180 (composição entre planos Starter, Pro e equivalentes de marketplace), o SAM em ARR representa R$1,08 bilhão.

O Mercado Obtível de Serviço (SOM) para o horizonte de 24 meses é conservadoramente estimado em 700 contas ativas, gerando MRR de R$250 mil e ARR de R$3 milhões — equivalente a aproximadamente 0,28% de penetração do SAM. O cenário de escala pós-Série A, com 20.000 contas ativas a ticket médio de R$200 mensais, projeta ARR de R$48 milhões, com múltiplo de valuation entre 8x e 12x ARR (típico de SaaS B2B com NRR superior a 110%) implicando valuation entre R$384 milhões e R$576 milhões.

### 3.2 Dinâmica Competitiva

O mercado de CRO e inteligência de conversão no Brasil é atualmente fragmentado entre três categorias de players: ferramentas globais não adaptadas para o contexto brasileiro (Hotjar, VWO, Crazy Egg), plataformas de marketing digital com funcionalidades tangenciais de análise de conteúdo (Semrush, Ahrefs), e consultorias especializadas de alto custo sem produto de software. Nenhum player endereça de forma integrada o diagnóstico psicológico automatizado, o monitoramento contínuo e o benchmark setorial em língua portuguesa.

A ausência de concorrência direta é, simultaneamente, uma oportunidade e um risco de execução. A oportunidade é a disponibilidade de um mercado sem solução dominante, com demanda latente comprovável. O risco é a necessidade de educação de mercado — o cliente potencial ainda não sabe que existe um produto que resolve seu problema de forma automatizada e recorrente. A estratégia de go-to-market da Klarivy é construída para minimizar esse risco via modelo PLG (Product-Led Growth), onde o primeiro laudo gratuito é o principal instrumento de demonstração de valor.

### 3.3 Timing de Mercado (Por que Agora)

Três vetores convergentes tornam 2025-2026 o momento ótimo para o lançamento de um produto como a Klarivy. Primeiro, a maturidade dos LLMs de produção — especificamente a família claude-sonnet — atingiu um patamar de precisão analítica e consistência de output suficiente para sustentar laudos técnicos acionáveis, algo inviável com os modelos disponíveis até 2023. Segundo, o custo de inferência de LLMs caiu dramaticamente, tornando o custo por análise de R$0,12 compatível com margens brutas de 88-90% em planos a partir de R$97 mensais. Terceiro, o e-commerce brasileiro completou sua curva de maturação pós-pandemia: operadores que antes bastava estar online agora enfrentam competição real e necessitam de ferramentas de otimização para sustentar crescimento — o mercado passou de "crescimento por demanda reprimida" para "crescimento por eficiência operacional".

---

## 4. Arquitetura do Produto

### 4.1 Módulo I — Landing Page Analyzer

O Landing Page Analyzer é o módulo fundacional da plataforma, organizado em cinco camadas funcionais que progressivamente elevam o valor entregue ao cliente e o custo de migração.

A **Camada 1 — Diagnóstico (Laudo)** é o ponto de entrada do produto e o primeiro momento de valor. O cliente fornece a URL de uma landing page; a plataforma executa coleta de conteúdo via Firecrawl (com suporte a renderização JavaScript), processa o conteúdo via Claude API com prompt estruturado pela metodologia NeuroConvert e entrega um laudo com: score global de 0 a 100, scores individuais nas cinco dimensões de análise, diagnóstico narrativo de cada dimensão e lista priorizada de três quick wins com impacto estimado. O laudo é armazenado de forma persistente com URL compartilhável, permitindo que o cliente apresente o diagnóstico internamente ou ao cliente final (no caso de agências).

A **Camada 2 — Monitoramento Contínuo** transforma o produto de serviço pontual em plataforma de inteligência recorrente. A plataforma re-analisa automaticamente cada página monitorada em intervalos definidos pelo plano (mensal no Starter, semanal no Pro, diário no Agency). O sistema de detecção de mudança via hash de conteúdo distingue alterações substantivas de variações dinâmicas (preço, estoque, personalização), disparando re-análise completa apenas quando o conteúdo estático da página muda. Alertas automáticos via email (processados via fila assíncrona com Resend) notificam o cliente quando o score cai além de um threshold configurável ou quando uma melhora significativa é detectada após implementação de quick wins.

A **Camada 3 — Benchmark Competitivo** adiciona inteligência de mercado ao diagnóstico individual. O cliente cadastra as URLs dos dois a três principais concorrentes; a Klarivy monitora todos e exibe um painel comparativo com score relativo, identificação das dimensões em que o concorrente lidera e as três principais oportunidades de diferenciação. Esse painel transforma o produto de ferramenta de melhoria interna para instrumento de vantagem competitiva ativa — o cliente não apenas sabe onde está, mas onde precisa chegar para superar o mercado.

A **Camada 4 — Prova de Impacto** resolve o problema crítico de atribuição: o cliente implementa uma recomendação, mas não sabe se a conversão melhorou em função dela. A integração com GA4 — ou, alternativamente, o input manual de taxa de conversão pelo cliente — permite que a plataforma construa o histórico de correlação entre variações de score NeuroConvert e variações de conversão real. Com dados suficientes, a plataforma passa a exibir, para cada tipo de quick win, a correlação média de impacto na conversão observada na base de clientes — transformando estimativas em dados empíricos.

A **Camada 5 — Roadmap de Implementação** é a etapa de maior valor agregado e maior complexidade técnica, programada para o horizonte de 12 a 24 meses. Vai além do "o que mudar" para entregar "como mudar" — templates de copy para cada dimensão diagnosticada como deficiente, mockups de layout baseados nos padrões de maior conversão na categoria, e sugestões de hierarquia visual geradas por modelos de visão computacional.

### 4.2 Módulo II — Marketplace Intelligence

O Marketplace Intelligence Module aplica a metodologia NeuroConvert especificamente ao contexto de anúncios em Mercado Livre e Shopee BR, plataformas com algoritmos, semântica e padrões de comportamento de comprador substancialmente distintos dos de lojas próprias. O módulo é organizado em três camadas funcionais:

A **Camada 1 — Rank Tracker** realiza rastreamento diário da posição de palavras-chave estratégicas no índice interno do marketplace. Via chamadas à API pública do Mercado Livre (e scraping estruturado da Shopee), o sistema registra a posição do anúncio do cliente para cada keyword monitorada, comparando com a posição dos três principais concorrentes. O sistema utiliza modelo de machine learning classificatório para identificar os atributos do título (extensão, posição de keyword, atributos técnicos, presença de marca) que correlacionam com ranking superior na categoria, gerando recomendações de reformulação de título com projeção de impacto em visibilidade orgânica.

A **Camada 2 — Q&A Intelligence** é o diferencial analítico mais exclusivo do módulo. A seção de Perguntas e Respostas dos anúncios de marketplace é a mais valiosa e a mais sistematicamente ignorada pelos vendedores. Cada pergunta de um comprador é, estruturalmente, uma objeção não resolvida pela descrição do anúncio. A plataforma extrai, classifica e agrupa as perguntas por categoria semântica (compatibilidade, dimensões, prazo de entrega, garantia, autenticidade), identifica as três a cinco objeções de maior frequência não endereçadas na descrição e gera sugestões de texto para incorporação. Para anúncios com volume insuficiente de perguntas (menos de cinco), o sistema recorre ao banco de dados proprietário de Q&As categorizadas para inferir as objeções mais prováveis com base no histórico de anúncios similares na mesma categoria.

A **Camada 3 — Catalog Triage** endereça um problema operacional específico de vendedores com catálogos de múltiplos SKUs: priorização de quais anúncios merecem atenção imediata. O sistema calcula um índice de oportunidade para cada SKU, combinando: score NeuroConvert atual, volume estimado de tráfego, taxa de conversão implícita (pedidos / visitas, quando disponível via API), margem de contribuição declarada pelo vendedor e intensidade competitiva da categoria. O output é um ranking de prioridade de SKUs, permitindo que o vendedor ou agência de marketplace concentre esforços de otimização nos anúncios de maior alavancagem financeira.

### 4.3 Engine de Análise NeuroConvert

A engine NeuroConvert é o núcleo analítico da plataforma, implementada como um sistema de prompts estruturados para Claude API com contexto de benchmark setorial injetado dinamicamente. Para o módulo de Landing Pages, a análise opera sobre cinco dimensões:

1. **Clareza da Proposta de Valor** — avalia se o visitante compreende em menos de cinco segundos o que o produto faz, para quem e por que é diferente.
2. **Carga Cognitiva** — mede a complexidade de processamento imposta ao visitante: densidade de texto, hierarquia visual, número de decisões solicitadas.
3. **Prova Social e Credibilidade** — analisa qualidade, especificidade e posicionamento de depoimentos, certificações, logos de clientes e garantias.
4. **Ancoragem e Framing de Preço** — examina como o preço é apresentado em relação ao valor, alternativas e garantias.
5. **Urgência e Redução de Fricção** — avalia elementos que aceleram a decisão de compra e removem barreiras ao próximo passo.

Para o módulo de Marketplace, a análise opera sobre seis dimensões: Título (SEO interno + atributos), Descrição (clareza de benefícios + objeções), Q&A Intelligence (objeções não endereçadas), Prova Social (avaliações + respostas a críticas), Ancoragem de Preço e Urgência e Confiança (logística + reputação).

O algoritmo de scoring pondera cada dimensão com pesos calibrados por categoria de negócio, derivados do banco de dados de correlações acumuladas. O output do Claude API é parseado via extração estruturada de JSON, validado via Zod antes de persistência no banco de dados, eliminando riscos de injeção de dados malformados. A temperatura do modelo é configurada para 0.3, favorecendo consistência analítica sobre criatividade de output.

### 4.4 Camada de Dados Proprietários

O banco de dados de benchmarks é o ativo estratégico de longo prazo da Klarivy. Cada análise realizada na plataforma — independentemente do plano do cliente — alimenta agregações anonimizadas que calculam: score médio por setor e subsetor, distribuição de scores por dimensão dentro de cada categoria, correlação entre tipos de quick win e melhora de score observada, sazonalidade de score (padrões de variação em períodos como Black Friday), e objeções mais frequentes por categoria de produto em marketplace.

Com 10.000 análises acumuladas, a Klarivy passa a dispor do maior banco de dados de diagnóstico de conversão em língua portuguesa, capaz de alimentar relatórios de benchmark setorial com valor editorial e de PR independente. Com 100.000 análises, o dataset torna-se um ativo de inteligência com valor independente do produto — tanto para uso interno (aumento de precisão diagnóstica) quanto para potenciais compradores estratégicos que buscam acesso a dados proprietários do mercado brasileiro.

---

## 5. Arquitetura Técnica

### 5.1 Stack e Decisões de Infraestrutura

A arquitetura técnica da Klarivy é construída sobre um conjunto de tecnologias deliberadamente selecionadas para maximizar a velocidade de desenvolvimento, minimizar o custo operacional e garantir confiabilidade em escala. As decisões de stack são as seguintes:

**Next.js 14 App Router (TypeScript):** a escolha do App Router permite colocar API routes e renderização server-side em um único deployment, eliminando a necessidade de um backend separado e reduzindo latência de chamadas internas. O TypeScript garante segurança de tipos end-to-end entre as camadas de API, banco de dados e componentes de frontend, com validação de schemas via Zod em cada boundary de entrada. O modelo de servidor de Next.js na Vercel é compatível com execução de análises longas via route handlers assíncronos, sem necessidade de infraestrutura adicional de workers.

**Supabase (PostgreSQL + Auth + Storage):** o Supabase foi selecionado pela combinação de PostgreSQL completo, Row Level Security (RLS) nativa, sistema de autenticação JWT integrado e client SDK com suporte a RPCs atômicas. A implementação de `complete_analysis()` como RPC atômica garante que a persistência de um laudo — incluindo a atualização do contador de créditos do usuário — ocorra de forma transacional, eliminando estados inconsistentes em caso de falha de rede ou timeout. O padrão de email_queue implementado via tabela Supabase com worker cron evita o envio síncrono de emails dentro de handlers HTTP, prevenindo timeouts e garantindo entrega mesmo em caso de falha transiente do serviço de email.

**Claude API (claude-sonnet-4-20250514):** o modelo claude-sonnet-4 foi selecionado pelo equilíbrio entre capacidade analítica, custo por token e velocidade de resposta. O custo médio por análise completa — incluindo prompt de sistema, conteúdo da página (limitado a 6.000 caracteres) e geração de laudo estruturado — é de aproximadamente R$0,08 em tokens de API. A arquitetura de prompt é organizada em três seções: contexto de metodologia (sistema), conteúdo da página e benchmarks de categoria (usuário), e instrução de output estruturado em JSON com schema definido. O uso de `temperature: 0.3` garante consistência analítica entre análises de páginas similares, mantendo comparabilidade de scores ao longo do tempo.

**Firecrawl:** a camada de coleta de conteúdo opera via Firecrawl, selecionado pela capacidade de renderização JavaScript completa — essencial para páginas construídas com frameworks SPA que não expõem conteúdo no HTML estático. O conteúdo extraído é limitado a 6.000 caracteres antes de envio ao Claude, controle implementado para gerenciar custo de tokens e manter o foco do modelo nos elementos de conversão relevantes. Para páginas com proteção Cloudflare ou autenticação, o sistema implementa fallback para captura de HTML via extensão de browser (roadmap Fase 3) ou entrada manual de conteúdo pelo cliente.

**Stripe:** a integração com Stripe gerencia o ciclo completo de subscriptions em BRL, incluindo criação de checkout sessions, gestão de upgrades e downgrades, e processamento de webhooks de eventos de cobrança. A idempotência de webhooks é garantida via constraint `UNIQUE` no campo `stripe_event_id` da tabela de eventos, prevenindo processamento duplicado de eventos entregues mais de uma vez pelo Stripe em caso de timeout. O sistema suporta múltiplos produtos simultâneos (Landing Page plans + Marketplace plans) com billing independente e combinável.

**Vercel Crons:** os jobs agendados — re-análise periódica de páginas monitoradas, renovação de créditos mensais Free e processamento da fila de emails — são executados via Vercel Cron Jobs. As limitações do plano Hobby (execução de crons com frequência mínima de uma hora) são mitigadas pelo design de filas: o cron dispara o processador de fila, que executa itens pendentes em batch até o timeout de execução, garantindo progresso contínuo mesmo com frequência limitada de trigger.

**Resend:** todos os envios de email — confirmação de análise, alertas de variação de score, relatórios mensais — são processados via fila assíncrona persistida no Supabase, nunca de forma síncrona dentro de handlers HTTP. O worker de email processa itens da fila `email_queue` em ordem de criação, com retry automático em caso de falha transitória e registro de status de entrega para auditoria.

### 5.2 Modelo de Dados

O schema do banco de dados é organizado em dois domínios principais: o domínio de Landing Pages (tabelas core) e o domínio de Marketplace Intelligence (tabelas `mp_*`).

As tabelas core incluem: `users` (perfil de usuário com plano ativo e contadores de crédito), `pages` (URLs monitoradas com hash de conteúdo para detecção de mudança), `analyses` (laudos individuais com scores por dimensão e conteúdo JSON completo), `competitors` (URLs de concorrentes vinculadas a páginas monitoradas), `email_queue` (fila de emails pendentes com status e metadados de retry), e `stripe_events` (log de webhooks processados com `stripe_event_id UNIQUE` para idempotência).

As sete tabelas `mp_*` do Marketplace Intelligence Module incluem: `mp_listings` (anúncios cadastrados com URL e metadados de plataforma), `mp_analyses` (laudos de anúncio com scores nas seis dimensões), `mp_keywords` (palavras-chave monitoradas por anúncio), `mp_rank_history` (histórico diário de posição por keyword), `mp_qa_items` (perguntas extraídas e classificadas por categoria semântica), `mp_qa_insights` (objeções identificadas com frequência e sugestão de endereçamento), e `mp_category_benchmarks` (agregações de benchmark por categoria de produto no marketplace).

Row Level Security é habilitado em todas as tabelas, com políticas que garantem que usuários autenticados acessem exclusivamente seus próprios dados. Operações administrativas — como atualização de benchmarks agregados e processamento de filas — são executadas via service role key em contexto de servidor, nunca exposta ao cliente.

### 5.3 Padrões de Segurança e Confiabilidade

A autenticação é implementada via JWT Supabase com refresh token automático, com sessões válidas por 24 horas e proteção de todas as rotas autenticadas via middleware Next.js. A variável de ambiente `ANALYZE_ALLOW_BODY_USER_ID` é utilizada exclusivamente em contexto de testes automatizados de integração, desabilitada em produção, permitindo injeção de user_id no body da request para execução de análises sem contexto de sessão ativa.

A validação de inputs de usuário é realizada via Zod em todos os endpoints de API antes de qualquer processamento ou persistência, com schemas estritamente tipados que rejeitam payloads malformados com erro 400 detalhado. A separação entre `anon key` (exposta no cliente para autenticação de usuário) e `service_role key` (disponível apenas em servidor para operações privilegiadas) é mantida estritamente, com a service_role key nunca incluída em bundles de cliente.

### 5.4 Escalabilidade e Custo Marginal

O custo marginal por análise de R$0,12 é composto por: R$0,08 em tokens Claude API (input + output) e R$0,04 em chamadas Firecrawl. Com plano Agency (R$697/mês) e frequência diária de re-análise para 50 páginas, o custo de API é de aproximadamente 1.500 análises × R$0,12 = R$180, gerando margem bruta de 74% no pior caso. Na prática, o cache de hash de conteúdo reduz o número de re-análises completas em aproximadamente 60% (páginas que não mudaram não são re-analisadas), elevando a margem efetiva para 88-90%.

Os thresholds de upgrade de infraestrutura são: migração de plano Hobby para Pro na Vercel ao atingir necessidade de crons com frequência inferior a uma hora (projetado para 200+ clientes Agency com monitoramento diário); migração para PostgreSQL dedicado ao atingir 500k rows em tabelas de análises (projetado para 18-24 meses de operação); e implementação de CDN de assets de laudos ao atingir tráfego de 50k pageviews mensais no dashboard. Os rate limits da Claude API (400 requests por minuto no tier de produção) são gerenciados via queue com throttling configurável no worker de análises.

---

## 6. Modelo de Negócio e Economia Unitária

### 6.1 Estrutura de Planos e Preços

A estrutura de planos é organizada em duas trilhas independentes e combináveis: Landing Pages e Marketplace Intelligence.

**Trilha Landing Pages:**

| Plano | Preço Mensal | Páginas Monitoradas | Frequência de Re-análise | Benchmark Competitivo | Funcionalidades Adicionais |
|---|---|---|---|---|---|
| Free | R$0 | 1 | Mensal | Não | Score global sem detalhamento por dimensão |
| Starter | R$97 | 3 | Mensal | Não | Laudo completo, alertas de variação, histórico de scores |
| Pro | R$247 | 10 | Semanal | 3 concorrentes por página | Histórico avançado, integração GA4, relatório mensal |
| Agency | R$697 | 50 | Diária | 5 concorrentes por página | White-label, API de acesso, dashboard de clientes, exportação PDF |

**Trilha Marketplace Intelligence:**

| Plano | Preço Mensal | Anúncios Monitorados | Rank Tracker | Q&A Intelligence | Catalog Triage |
|---|---|---|---|---|---|
| Free | R$0 | 1 análise/mês | Não | Limitado | Não |
| Seller | R$147 | 10 | 5 keywords/anúncio | Completo | Básico (top 3 SKUs) |
| Agency | R$347 | Ilimitado | Ilimitado | Completo + categoria | Completo + exportação |

A lógica de precificação segue o princípio de ROI imediato e verificável: para um e-commerce com faturamento de R$100 mil mensais, o plano Pro a R$247 representa 0,25% do faturamento. Uma melhoria de 0,5 ponto percentual em conversão — meta conservadora para uma página com diagnóstico estruturado — gera R$2.000 a R$5.000 de receita incremental no mesmo mês, com payback de horas, não meses.

### 6.2 Economia Unitária

Os parâmetros de economia unitária são derivados de premissas conservadoras alinhadas a benchmarks de SaaS B2B verticais com modelo PLG:

**Custo de Aquisição de Cliente (CAC):** em fase PLG com conteúdo orgânico como canal primário, o CAC blended é estimado em R$200 (distribuição de custos entre produção de conteúdo, SEO e uma parcela de paid social no LinkedIn). À medida que o canal de parceiros de agências amadurece, o CAC via agência é próximo de zero — a agência é o cliente, e seus clientes finais são as páginas analisadas.

**Lifetime Value (LTV):** com churn mensal de 2% (equivalente a 98% de retenção), o LTV de um cliente Pro (R$247/mês) é de R$247 / 0,02 = R$12.350. Com churn de 1,5% (meta de 24 meses), o LTV sobe para R$16.467. O LTV/CAC ratio projetado em 12 meses é de 5,5x, elevando-se para 8x em 24 meses com expansão de receita via upsell de páginas adicionais.

**Net Revenue Retention (NRR):** a métrica mais crítica para a saúde de longo prazo do negócio. O modelo de monitoramento por páginas — não por laudos consumidos — cria mecanismo natural de expansão: clientes adicionam páginas ao longo do tempo. O NRR alvo de 110% em 24 meses indica que a base de clientes existente cresce 10% em receita mensalmente mesmo sem novos clientes, via upsells de páginas e upgrades de plano.

**Payback Period:** com CAC de R$200 e ticket médio de R$150 (plano Starter ponderado), o payback bruto é de 1,3 meses. Com LTV/CAC > 5x, cada real investido em aquisição gera R$5 em retorno ao longo da vida do cliente.

### 6.3 Projeções Financeiras (24 Meses)

| Mês | MRR | Assinantes Pagos | Churn Mensal | NRR | Gross Margin |
|---|---|---|---|---|---|
| 3 | R$5.000 | 25 | 5,0% | 92% | 88% |
| 6 | R$15.000 | 65 | 4,0% | 96% | 88% |
| 9 | R$30.000 | 120 | 3,5% | 100% | 89% |
| 12 | R$60.000 | 220 | 3,0% | 105% | 89% |
| 18 | R$130.000 | 450 | 2,5% | 108% | 90% |
| 24 | R$250.000 | 700 | 2,0% | 113% | 90% |

O break-even operacional — cobertura de todos os custos de infraestrutura (Supabase, Vercel, Firecrawl, Resend, Stripe fees) estimados em R$800 mensais — é atingido com 6 assinantes no plano Pro ou 9 assinantes no plano Starter, tornando o risco de runway financeiro mínimo a partir do primeiro mês com clientes pagantes.

---

## 7. Diferenciação Competitiva e Moat

### 7.1 Vantagens Estruturais

A Klarivy é construída sobre três vantagens estruturais que se reforçam mutuamente e são progressivamente mais difíceis de replicar com o crescimento da base de dados.

A primeira vantagem é a **metodologia NeuroConvert como framework analítico proprietário**. O conjunto de dimensões de análise, pesos de scoring por categoria, prompts de LLM e lógica de priorização de quick wins representa um acúmulo de conhecimento aplicado que não é reproduzível por uma ferramenta genérica de LLM. Um usuário que abre o Claude diretamente obtém uma análise ad hoc sem metodologia, sem benchmark, sem histórico e sem comparabilidade — fundamentalmente distinta do produto Klarivy.

A segunda vantagem é o **banco de dados de benchmarks setoriais**, detalhado na seção 4.4. Esse banco de dados é alimentado de forma acumulativa e assimétrica: cada nova análise contribui para a precisão dos benchmarks, que tornam as análises subsequentes mais precisas, que aumentam o valor percebido do produto, que atraem mais análises. Este ciclo de reforço positivo — típico de efeitos de rede de dados — é inacessível a qualquer concorrente que não possua base de análises prévia.

A terceira vantagem é o **lock-in operacional por acúmulo de histórico**. Um cliente que monitora 10 páginas por 12 meses na Klarivy acumula: 52 análises semanais por página, histórico de scores com correlação de conversão, histórico de quick wins implementados com resultado medido, e benchmark contínuo contra concorrentes. Esse histórico não é portável — migrá-lo para outra ferramenta significa perder toda a inteligência acumulada sobre o comportamento de conversão de suas páginas específicas. O custo de migração, portanto, é substancialmente superior ao custo de retenção.

### 7.2 O Efeito de Rede de Dados

Diferente de efeitos de rede de usuários — onde o valor da plataforma aumenta proporcionalmente ao número de usuários conectados, como em marketplaces — a Klarivy opera um **efeito de rede de dados**: o valor do produto para qualquer usuário individual aumenta em função do volume total de análises realizadas na plataforma. Um laudo gerado com acesso a benchmarks de 100.000 análises prévias em e-commerce de moda feminina é qualitativamente superior a um laudo sem esse contexto, mesmo que a engine analítica seja idêntica. Este efeito é unidirecional e cumulativo: não decresce com o tempo e não pode ser replicado instantaneamente por novos entrantes.

### 7.3 Barreira de Idioma e Contexto

A especificidade cultural e linguística do mercado de língua portuguesa representa uma barreira de entrada genuína para players globais. Hotjar, Semrush, Jungle Scout e Helium10 dispõem de recursos de engenharia e distribuição muito superiores aos da Klarivy — mas estão fundamentalmente mal posicionados para replicar o produto no contexto brasileiro por três razões estruturais.

Primeiro, as interfaces de marketplace brasileiras (Mercado Livre, Shopee BR) possuem semântica, algoritmos de ranking e padrões de comportamento de comprador radicalmente distintos de Amazon US ou Amazon UK — a base sobre a qual esses produtos foram construídos. Uma adaptação para o contexto brasileiro não é uma questão de tradução de interface, mas de reengenharia do modelo analítico.

Segundo, a eficácia dos prompts da engine NeuroConvert é função da profundidade de contexto cultural: padrões de linguagem persuasiva em português brasileiro, nuances de confiança e credibilidade no contexto de e-commerce nacional, senso de urgência culturalmente adequado, e referências de prova social que ressoam com o consumidor brasileiro. Esse contexto é acumulado iterativamente e não está disponível para players sem presença ativa no mercado.

Terceiro, e mais importantly, o banco de dados de benchmarks em português é um ativo que simplesmente não existe fora da Klarivy. Players globais que queiram entrar no mercado brasileiro de CRO começariam do zero nesse banco de dados, sem a vantagem de anos de análises acumuladas.

### 7.4 Lock-in Operacional

O lock-in operacional da Klarivy opera em três camadas que aumentam progressivamente com o tempo de uso. A primeira camada é o **histórico de scores**: o gráfico de evolução de score de cada página ao longo do tempo é um ativo que existe exclusivamente dentro da plataforma — não há forma de exportá-lo para um concorrente sem perder a continuidade temporal. A segunda camada é o **histórico de quick wins implementados**: o registro de quais recomendações foram executadas, quando e com que resultado é o equivalente a um diário de CRO que acompanha a evolução da estratégia de conversão do cliente. A terceira camada é o **benchmark de concorrentes monitorados**: os clientes que monitoram seus concorrentes ao longo do tempo constroem uma base de comparação histórica — saber que o concorrente X tinha score 65 há seis meses e hoje está em 78 é uma informação que só existe dentro da Klarivy.

---

## 8. Análise de Riscos

| Risco | Severidade | Probabilidade | Mitigação |
|---|---|---|---|
| **Credibilidade da análise de IA** — CROs experientes questionam a precisão diagnóstica sem dados comportamentais reais | Alta | Alta | Posicionamento explícito como ferramenta complementar (não substituta) de Hotjar/GA4. Construção acelerada de casos de uso com correlação medida. Integração com GA4 para cruzar score com conversão real. |
| **Replicação por big players** — Hotjar, Semrush ou RD Station adicionam funcionalidade de diagnóstico LLM | Média | Média | Banco de dados em PT-BR não replicável em curto prazo. Velocidade de execução e especialização de contexto. Relacionamento com agências como canal defensável. |
| **Escalabilidade de custo de API** — aumento de preços da Claude API com volume | Baixa (curto prazo) / Média (médio prazo) | Baixa | Otimização contínua de prompts. Cache de análises via hash de conteúdo (reduz 60% das re-análises). Análise em dois estágios: detecção de mudança rápida + análise completa condicional. |
| **Bloqueio de scraping por Firecrawl** — plataformas com Cloudflare, autenticação ou anti-bot agressivo | Média | Média | Firecrawl suporta rendering JavaScript e bypass básico de anti-bot. Fallback para API oficial do Mercado Livre (dados estruturados). Extensão de browser como fallback de última instância. |
| **Gap de prova de impacto** — cliente implementa recomendações mas não consegue medir resultado | Alta (para retenção de 6+ meses) | Alta | Integração GA4 como prioridade de Fase 2. Sistema de "quick win marcado como implementado" com re-análise automática. Relatório mensal de correlação score/conversão. |
| **Mudanças de API de marketplace** — Mercado Livre ou Shopee alteram estrutura de API ou termos de uso de scraping | Média | Baixa | Diversificação de fontes de dados (API oficial + scraping + entrada manual). Monitoramento de mudanças de estrutura via alertas de parsing. Cláusula de SLA ajustada para módulo de marketplace. |
| **Churn alto em fase inicial** — produto sem monitoramento contínuo entrega valor pontual com churn > 5%/mês | Alta | Alta (se Fase 1 não for executada) | Prioridade absoluta de Fase 1 é implementar re-análise automática e histórico de scores antes de qualquer nova feature. Onboarding estruturado com quick win implementado em 48h. |

---

## 9. Estratégia de Go-to-Market

### 9.1 ICP Primário e Secundário

O ICP primário da Klarivy é o **gestor de tráfego pago / performance marketer** com carteira de 5 a 20 clientes. Este perfil é o comprador ideal pela confluência de motivações: a performance da landing page é determinante direta do ROI das campanhas que ele gerencia, o que torna o custo da Klarivy imediatamente justificável como ferramenta de proteção de resultado; ele trabalha com múltiplas páginas por múltiplos clientes, maximizando o valor extraído da plataforma; e ele está habituado a ferramentas de SaaS com precificação mensal, tendo baixa fricção de adoção. O argumento de venda é direto: "Você otimiza o anúncio com precisão milimétrica. A landing page que recebe esse tráfego nunca foi auditada. A Klarivy monitora todas as suas páginas de cliente e te avisa quando algo piora — antes do cliente reclamar."

O ICP secundário é o **dono de e-commerce com faturamento entre R$50 mil e R$500 mil mensais**. Este perfil tem a dor mais intensa em termos financeiros, mas o ciclo de adoção é mais longo — o fundador ou gestor de e-commerce está constantemente sobrecarregado com operações logísticas, financeiras e de produto, e tende a priorizar ferramentas que provem valor de forma autônoma, sem demandar tempo de configuração ou análise. A estratégia para este perfil é PLG puro: o laudo gratuito deve entregar valor suficiente para motivar upgrade sem intervenção humana de vendas.

### 9.2 Canais de Aquisição

O canal primário de aquisição orgânica é **conteúdo técnico de CRO em português**. A publicação de análises detalhadas de páginas de marcas conhecidas (Shopee, Magazine Luiza, iFood, Nubank, Nuvemshop) usando a metodologia NeuroConvert serve simultaneamente como demonstração de produto, geração de SEO para termos de alta intenção ("análise de landing page", "CRO Brasil", "otimização de conversão e-commerce") e construção de autoridade de marca. Este conteúdo tem custo de produção baixo — cada análise publicada é gerada pelo próprio produto — e vida útil longa como ativo de SEO.

O canal secundário é **distribuição via comunidades de performance**: grupos de Facebook de gestores de tráfego, comunidades no WhatsApp de profissionais de e-commerce, eventos como RD Summit, Fire Festival e Afiliados Brasil, e conteúdo no LinkedIn direcionado especificamente ao perfil de gestor de performance. A oferta de análise gratuita como hook de PLG é o mecanismo de conversão nestes canais.

### 9.3 Modelo PLG (Product-Led Growth)

O modelo PLG da Klarivy é estruturado em torno do laudo gratuito como "aha moment" imediato. O fluxo de ativação ideal é: cadastro → URL inserida em menos de 60 segundos → laudo entregue em menos de 3 minutos → score apresentado com benchmark setorial ("seu score é 52, a média do setor é 61") → três quick wins priorizados com impacto estimado. Se o usuário implementa um quick win e solicita re-análise para ver o score melhorar, o produto demonstrou valor de ciclo completo e a probabilidade de conversão para plano pago aumenta em 4 a 6 vezes, segundo benchmarks de PLG em ferramentas de análise similares.

O funil de conversão PLG alvo é: ativação (free → primeira análise completada) > 60% em 7 dias; retenção (voltou a usar em D30) > 30%; free → pago > 5% em 30 dias; churn mensal pago < 3%.

### 9.4 Estratégia de Parceiros (Agências)

O canal de parceiros é o multiplicador de receita de maior alavancagem no médio prazo. Uma agência que adota a Klarivy para sua base de 20 clientes paga R$697/mês (plano Agency) e representa o equivalente econômico de 2,8 clientes Pro individuais — com custo de aquisição próximo de zero após o primeiro contato e churn estruturalmente baixo (a agência não cancela enquanto tem clientes ativos na plataforma). O programa de parceiros é estruturado com: desconto de 20% no plano Agency para primeiras doze agências parceiras, material de revenda white-label incluído no plano, dashboard dedicado de gerenciamento de clientes com visão consolidada de todas as páginas monitoradas, e relatório mensal de "saúde de conversão" exportável em PDF com marca da agência para apresentação a clientes finais.

---

## 10. Tese de Investimento e Caminhos de Exit

### 10.1 Por que a Klarivy é Investível

A Klarivy reúne seis características que a posicionam como ativo investível para fundos de venture capital focados em SaaS B2B ou para investidores-anjo com tese em martech:

Primeiro, opera em um mercado real e doloroso — a otimização de conversão é uma necessidade operacional de qualquer negócio digital, não um nicho de luxo ou conveniência. Segundo, o modelo de receita recorrente com monitoramento por páginas cria lock-in de dados que sustenta churn estruturalmente baixo — projetado para atingir 2% ao mês (NRR > 110%) em 24 meses. Terceiro, a margem bruta de 88-90% garante que cada real de receita incremental converte em quase um real de EBITDA incremental após break-even, sem necessidade de escalonamento proporcional de custos variáveis. Quarto, o banco de dados de benchmarks de conversão em português é um ativo proprietário que cresce de forma assimétrica — não pode ser replicado por competidores sem o mesmo volume de análises históricas. Quinto, a expansão natural dentro da conta (clientes adicionam páginas e módulos ao longo do tempo) sustenta NRR superior a 110%, a métrica que distingue SaaS mediocres de extraordinários. Sexto, a operação é viável com equipe de uma a três pessoas até MRR de R$100 mil, com estrutura de custos fixos mínima e sem dependência de capital para viabilidade operacional.

### 10.2 Compradores Estratégicos Potenciais

| Comprador Potencial | Racional de Aquisição | Múltiplo Esperado | Fit Estratégico |
|---|---|---|---|
| **RD Station** | Adiciona CRO e inteligência de conversão ao ecossistema líder de marketing digital no Brasil. Distribuição imediata para base de 50k+ clientes. | 8–12x ARR | Alto — produto complementar ao CRM e automação de marketing |
| **VTEX** | Diferencial de conversão nativo para lojistas na plataforma. Klarivy como feature integrada ao painel VTEX. | 10–15x ARR | Alto — acesso direto ao ICP de e-commerce |
| **Nuvemshop** | Mesmo racional da VTEX. Base de 100k+ lojistas como canal de distribuição imediato. | 8–12x ARR | Alto — alinhamento de ICP e canal |
| **Hotjar / Contentsquare** | Expansão para mercado brasileiro com produto de diagnóstico psicológico complementar a dados comportamentais. Banco de dados PT-BR como ativo principal. | 10–20x ARR | Médio-alto — produto complementar, mercado novo |
| **Semrush** | Adiciona módulo de CRO ao pacote de marketing digital. Expansão de cross-sell para base existente de clientes brasileiros. | 8–15x ARR | Médio — expansão de categoria, não core |
| **Mercado Livre** | Aquisição do módulo Marketplace Intelligence como ferramenta interna ou oferta para vendedores da plataforma. Dataset de Q&A e benchmarks de categoria como ativo primário. | 6–12x ARR | Alto para módulo específico — acesso a inteligência de catálogo |

O cenário de exit mais provável no horizonte de três a cinco anos é uma aquisição por plataforma de e-commerce (VTEX ou Nuvemshop) ou plataforma de marketing digital (RD Station), dado o alinhamento de ICP e a capacidade de distribuição imediata para bases de clientes existentes. O cenário de exit mais lucrativo é uma aquisição por player global (Hotjar, Contentsquare, Semrush) interessado no banco de dados proprietário em português e no canal de distribuição brasileiro — com múltiplos potencialmente superiores por escassez de ativos comparáveis no mercado.

### 10.3 Condições para Exit Relevante

O conjunto de condições que posicionam a Klarivy como alvo de aquisição com valuation defensável inclui: NRR superior a 110% mantido por seis ou mais meses consecutivos, demonstrando que o modelo de retenção e expansão é estrutural, não circunstancial; 500 ou mais clientes pagantes ativos, atingindo a escala mínima de relevância para decisões de M&A estratégico; banco de dados com 50.000 ou mais análises acumuladas, conferindo ao dataset valor independente do produto como SaaS; pelo menos uma parceria de distribuição com plataforma estabelecida (VTEX, Nuvemshop, RD Station), comprovando canal escalável que o comprador herda; e MRR superior a R$150 mil, gerando ARR de R$1,8 milhão com múltiplo de 10x implicando valuation de R$18 milhões — suficiente para um exit relevante para uma operação de uma a três pessoas.

---

## 11. Roadmap de Produto

### 11.1 Fase 1 — Fundação (Meses 0–3)

O objetivo da Fase 1 é consolidar a infraestrutura técnica e transformar o laudo pontual em produto com mecanismo mínimo de retenção. As entregas críticas incluem: implementação de auth guard em todas as rotas autenticadas; migração de envio de email para padrão assíncrono via `email_queue`; dashboard funcional com histórico de laudos e evolução de score por página; URL persistente e compartilhável para cada laudo individual; cron de renovação mensal de crédito para plano Free; e instalação de product analytics (PostHog) com cobertura de 20 eventos de funil críticos. A métrica de sucesso da Fase 1 é retenção D30 superior a 20% nos primeiros 100 usuários — indicando que o produto entrega valor suficiente para motivar retorno espontâneo.

### 11.2 Fase 2 — Monitoramento e Retenção (Meses 3–6)

A Fase 2 transforma o produto de ferramenta de diagnóstico pontual em plataforma de monitoramento contínuo. As entregas incluem: sistema de detecção de mudança de conteúdo via hash com re-análise automática condicional; alertas de variação de score via email com threshold configurável; gráfico de histórico de score por página com linha de tendência; suporte a múltiplas páginas por conta (início do modelo de monitoramento); sistema de "quick win implementado" — cliente marca a execução de uma recomendação e o sistema agenda re-análise automática; e primeira versão do benchmark competitivo (análise de URLs de concorrentes). A métrica de sucesso da Fase 2 é NRR calculável superior a 100% e churn mensal inferior a 3%.

### 11.3 Fase 3 — Marketplace Intelligence (Meses 6–12)

A Fase 3 lança o Marketplace Intelligence Module, iniciando com beta fechado de 20 vendedores selecionados (meses 6-9) e abrindo para lançamento público com pricing próprio (meses 9-12). As entregas incluem: scraping e análise de anúncios Mercado Livre e Shopee via Firecrawl + Claude; engine de Q&A Intelligence com extração, classificação e agrupamento semântico de perguntas; Rank Tracker com rastreamento diário de posição por keyword; Catalog Triage com índice de oportunidade por SKU; integração com API pública do Mercado Livre para dados estruturados; e schema de banco de dados `mp_*` com sete novas tabelas. A métrica de sucesso da Fase 3 é 50 clientes pagantes no plano Seller com churn inferior a 4% ao mês.

### 11.4 Fase 4 — Escala e Moat (Meses 12–24)

A Fase 4 consolida as vantagens competitivas e constrói as bases para o exit. As entregas incluem: programa de parceiros para agências com dashboard white-label e material de revenda; integração com GA4 para correlação de score com dados reais de conversão; extensão de browser como fallback para análise de páginas com JavaScript complexo ou proteção anti-bot; publicação de relatórios públicos de benchmark de mercado ("O E-commerce Brasileiro: Score Médio de Conversão por Setor") para geração de PR e backlinks; integração com plataformas de e-commerce (VTEX, Nuvemshop, Shopify BR) para enriquecimento de contexto de análise; e início de treinamento de modelo fine-tuned em dados proprietários de análise brasileira para redução de custo de inferência e aumento de precisão. A métrica de sucesso da Fase 4 é MRR de R$250 mil com NRR superior a 113% e banco de dados com 50.000+ análises acumuladas.

---

## 12. Conclusão

A Klarivy endereça uma lacuna estrutural no mercado digital brasileiro: a ausência de um instrumento técnico acessível e recorrente para diagnóstico e monitoramento de barreiras à conversão em landing pages e anúncios de marketplace. O produto é construído sobre uma combinação de vantagens que se reforçam mutuamente — metodologia NeuroConvert proprietária, banco de dados de benchmarks em língua portuguesa, especialização no contexto de plataformas brasileiras e lock-in operacional por acúmulo de histórico — e opera com economias unitárias excepcionais: margem bruta de 88-90%, break-even com seis assinantes, custo marginal de R$0,12 por análise.

O produto começa como diagnóstico (laudo de landing page). Evolui para monitoramento contínuo (score tracking + alertas + histórico). Cresce para inteligência competitiva (benchmark setorial + concorrentes). Expande verticalmente para novos canais (marketplace, com potencial futuro em anúncios pagos e WhatsApp commerce). Matura como sistema de otimização permanente com correlação empírica entre score NeuroConvert e conversão real medida. Em cada etapa, o banco de dados proprietário cresce, o custo de migração do cliente aumenta e a vantagem competitiva se aprofunda.

O caminho de escala não requer capital intensivo: a estrutura de custos fixos mínima permite crescimento orgânico sustentável via PLG e conteúdo, com reinvestimento de receita como mecanismo primário de financiamento. O caminho de exit é múltiplo e defensável — seja via aquisição estratégica por plataforma de e-commerce ou marketing digital brasileira (VTEX, Nuvemshop, RD Station), seja via interesse de player global no banco de dados em português (Hotjar, Semrush, Contentsquare). O caminho independente — MRR de R$250 mil com NRR superior a 110% e equipe de três pessoas — é um negócio extraordinariamente rentável por si só.

A pergunta definitiva para os próximos noventa dias não é qual feature construir a seguir — é se os clientes que usaram o produto voltam sem ser empurrados. Se a resposta for sim, a Klarivy tem um produto. Se o produto tem retenção, tem um negócio. Se o negócio tem NRR superior a 110%, tem um ativo de valor extraordinário — seja para continuar crescendo de forma independente, seja para fazer um exit relevante com múltiplo defensável.

---

## Apêndice A — Glossário Técnico

**NeuroConvert:** metodologia proprietária de análise de conversão da Klarivy. Combina princípios de psicologia cognitiva, persuasão e arquitetura de informação em um framework de avaliação estruturado, implementado como sistema de prompts para LLMs com contexto de benchmark setorial dinâmico. Produz scores comparáveis ao longo do tempo e entre páginas da mesma categoria.

**Laudo:** documento técnico gerado pela engine NeuroConvert para uma URL específica em um momento específico. Contém: score global (0–100), scores individuais por dimensão de análise, diagnóstico narrativo de cada dimensão e lista priorizada de quick wins com impacto estimado. Armazenado de forma persistente com URL compartilhável e incluído no histórico de scores da página.

**NRR (Net Revenue Retention):** métrica de expansão de receita da base de clientes existente. Calculado como: (MRR da coorte no mês T + expansão via upsell − churn − downgrades) / MRR da coorte no mês T−12. NRR superior a 100% indica que a receita da base existente cresce mesmo sem novos clientes. NRR superior a 110% é o threshold que caracteriza SaaS de crescimento acelerado e alta qualidade de retenção.

**PLG (Product-Led Growth):** modelo de go-to-market em que o produto é o principal mecanismo de aquisição, ativação e expansão de clientes. Na Klarivy, o laudo gratuito é o instrumento central de PLG — demonstra valor de forma autônoma, sem intervenção de vendas, e converte usuários gratuitos em pagantes via experiência de produto.

**CRO (Conversion Rate Optimization):** disciplina de melhoria sistemática da taxa de conversão de páginas digitais e anúncios, combinando análise de comportamento de usuário, testes A/B, copywriting e design de experiência.

**CAC (Customer Acquisition Cost):** custo total de aquisição de um novo cliente pagante, incluindo custos de marketing, vendas e onboarding. Na fase PLG da Klarivy, o CAC blended é estimado em R$200, composto principalmente por custos de produção de conteúdo e distribuição orgânica.

**LTV (Lifetime Value):** receita total esperada de um cliente ao longo de seu relacionamento com a plataforma. Calculado como ticket médio mensal / churn mensal. Com churn de 2% e ticket Pro de R$247, o LTV é R$12.350.

**Tabelas `mp_*`:** conjunto de sete tabelas do banco de dados PostgreSQL (Supabase) dedicadas ao Marketplace Intelligence Module: `mp_listings`, `mp_analyses`, `mp_keywords`, `mp_rank_history`, `mp_qa_items`, `mp_qa_insights`, `mp_category_benchmarks`. Isoladas do schema de landing pages para permitir billing e acesso independentes entre módulos.

**`complete_analysis()` RPC:** Remote Procedure Call atômica implementada no Supabase que persiste o resultado de uma análise e atualiza o contador de créditos do usuário em uma única transação de banco de dados. Garante consistência de dados mesmo em caso de falha de rede entre a chamada ao Claude API e a persistência do resultado.

**`email_queue` pattern:** padrão de arquitetura em que envios de email não são executados de forma síncrona dentro de handlers HTTP, mas registrados em uma tabela de fila (`email_queue`) no banco de dados e processados por um worker assíncrono (Vercel Cron). Previne timeouts de request, garante entrega mesmo com falhas transitórias do serviço de email (Resend) e permite retry automático.

---

## Apêndice B — Métricas de Validação de PMF

O Product-Market Fit (PMF) da Klarivy é validado de forma quantitativa por um conjunto de métricas observadas na base de usuários reais, não por pesquisas de intenção ou NPS isolado:

| Métrica | Definição | Threshold de PMF | Como Medir |
|---|---|---|---|
| **Ativação D7** | % de usuários Free que completam ao menos uma análise em 7 dias após cadastro | > 60% | Evento `analyze_completed` no PostHog |
| **Retenção D30** | % de usuários que voltam a usar a plataforma (nova análise ou consulta a laudo existente) em D30 | > 30% | Sessão autenticada com ação registrada em D28–D32 |
| **Conversão Free→Pago** | % de usuários Free que convertem para plano pago em 30 dias | > 5% | Evento de checkout Stripe em até 30 dias do cadastro |
| **Churn Mensal Pago** | % de assinantes pagantes que cancelam no mês | < 3% | Cancelamentos Stripe / base ativa no início do mês |
| **NPS Pós-Laudo** | Net Promoter Score coletado 48h após primeira análise | > 40 | Survey automático via Resend 48h após `analyze_completed` |
| **Expansão de Páginas** | % de clientes pagantes que adicionam ao menos uma página adicional em 60 dias | > 25% | Contagem de páginas por conta em D60 vs. D0 |
| **Implementação de Quick Win** | % de clientes que marcam ao menos um quick win como implementado em 30 dias | > 15% | Evento `quickwin_marked_done` no PostHog |

O sinal definitivo de PMF verdadeiro é a combinação de: cliente que monitora três ou mais páginas, não cancela após três meses de uso e expande o número de páginas monitoradas sem incentivo ativo de vendas. Este perfil representa um cliente que descobriu valor estrutural e integrou o produto ao seu fluxo operacional recorrente — o estado de lock-in que sustenta NRR superior a 110% e torna o negócio defensável.

---

*White Paper produzido para uso interno e apresentação a investidores estratégicos.*
*Revisão programada: Agosto de 2026.*
*Contato: veidz@skoolab.com.br | www.klarivy.com*
