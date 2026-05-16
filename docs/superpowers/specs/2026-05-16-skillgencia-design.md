# skillgência — Design Spec

**Data:** 2026-05-16  
**Status:** Aprovado  
**Stack:** SvelteKit + PocketBase + Meta Graph API + opensquad

---

## Visão Geral

skillgência é uma plataforma de gestão de mídias sociais para agências. Gerencia múltiplos clientes, cada um com seu próprio design system, conexão Meta API, posts agendados e métricas. opensquad automatiza processos internos (geração de conteúdo, análise, publicação em lote).

**Entidade central: cliente.** Tudo orbita o cliente — design, posts, métricas, automações.

**Usuários-alvo:**
- Não-técnico (gestor de social media, dono de agência) — usa UI visual
- Técnico (dev, ops) — acessa API/CLI, configura squads

---

## Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                    skillgência                       │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │              SvelteKit                      │    │
│  │  Frontend (UI) + API Routes (/api/*)        │    │
│  └──────────┬──────────────────────┬───────────┘    │
│             │                      │                 │
│  ┌──────────▼──────┐    ┌──────────▼─────────────┐  │
│  │   PocketBase    │    │     Meta Graph API      │  │
│  │  Auth + DB +    │    │  (por cliente, OAuth)   │  │
│  │  Realtime       │    └─────────────────────────┘  │
│  └──────────┬──────┘                                 │
│             │                                        │
│  ┌──────────▼──────────────────────────────────┐    │
│  │              opensquad                      │    │
│  │  Motor de automação (child_process)         │    │
│  │  Geração conteúdo · Análise · Publicação    │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

**Deploy:** Docker Compose — 2 containers (`app` SvelteKit + `pocketbase`). VPS-friendly.

---

## Estrutura de Dados (PocketBase Collections)

```
users (auth nativo PocketBase)
├── email, password, name, avatar
└── role: "admin" | "member"

clients
├── id, name, slug, logo
├── brand_colors: JSON        # paleta do cliente
├── brand_fonts: JSON         # tipografia
├── brand_assets: File[]      # logos, elementos visuais
└── created_by → users

client_members
├── client → clients
├── user → users
└── role: "admin" | "editor" | "viewer"

meta_connections
├── client → clients
├── platform: "instagram" | "facebook"
├── access_token: string      # criptografado em repouso
├── page_id: string
├── account_id: string
└── expires_at: datetime

design_templates
├── client → clients
├── name, description
├── thumbnail: File
├── config: JSON              # layout, elementos, variáveis do template
└── category: "feed" | "story" | "carousel" | "reel"

posts
├── id
├── client → clients
├── template → design_templates (opcional)
├── platform: "instagram" | "facebook"
├── content: text             # legenda
├── media: File[]
├── status: "draft" | "scheduled" | "published" | "failed"
├── scheduled_at: datetime
├── published_at: datetime
├── meta_post_id: string      # ID retornado pela Meta API após publicação
└── created_by → users

metrics_cache
├── client → clients
├── platform: string
├── period_start, period_end: datetime
├── data: JSON                # métricas brutas da Meta API
└── fetched_at: datetime      # TTL 1h — re-fetch se expirado

squads
├── client → clients (opcional — squad pode ser global)
├── name, description
├── config: JSON              # YAML serializado do opensquad
└── created_by → users

runs
├── squad → squads
├── status: "pending" | "running" | "completed" | "failed"
├── triggered_by → users     # null se agendado
├── started_at, finished_at
└── output: JSON             # logs por agente em tempo real

schedules
├── squad → squads
├── cron_expression: string
├── enabled: bool
└── timezone: string
```

---

## Navegação & Telas

```
Sidebar Principal
│
├── Dashboard              Overview geral (todos os clientes)
│
├── Clientes               Lista de clientes
│   └── [Cliente]          contexto muda aqui
│       ├── Métricas       Meta API + filtros (período, plataforma, tipo)
│       ├── Design         Templates + editor visual por brand
│       ├── Posts          Calendário + lista (draft/scheduled/published)
│       ├── Configurações  OAuth Meta, brand assets, paleta, fontes
│       └── Automações     Squads opensquad vinculados ao cliente
│
├── Squads                 Gestão global de squads opensquad
│   ├── Lista
│   ├── Criar
│   └── Histórico de execuções
│
└── Configurações
    ├── Usuários & permissões
    └── Integrações gerais
```

### Telas detalhadas

**Dashboard** — cards por cliente: posts agendados hoje, métricas resumidas (reach, engagement), alertas (token expirado, post falhou).

**Métricas** — gráficos de reach/impressions/engagement. Filtros: plataforma, período, tipo de conteúdo. Cache 1h.

**Design** — grid de templates do cliente. Editor: seleciona template → preenche variáveis (texto, imagem, cor) → exporta mídia.

**Posts** — visão calendário + lista. Criar post: plataforma, mídia (upload ou do Design), legenda, data/hora. Status por cor.

**Configurações do Cliente** — OAuth flow Meta (Instagram/Facebook), upload brand assets, edição paleta/fontes.

---

## Integrações

### Meta Graph API

```
1. OAuth redirect → Meta Login → access_token retornado
2. Token salvo criptografado em meta_connections
3. Publicação: POST /v19.0/{page-id}/media + /publish
4. Agendamento: node-cron verifica posts com scheduled_at ≤ now → publica
5. Métricas: GET /v19.0/{account-id}/insights → cache metrics_cache (TTL 1h)
6. Token refresh automático antes de expirar
```

### opensquad

```
_workspaces/
└── [client-id]/
    └── squads/
        └── [squad-name]/
            ├── SQUAD.yaml
            └── memory/

Fluxo execução:
API → runner.ts → spawn("npx opensquad run") →
stdout stream → PocketBase runs.output (Realtime) →
UI atualiza em tempo real
```

---

## Estrutura de Arquivos

```
skillgência/
├── src/
│   ├── lib/
│   │   ├── pocketbase.ts       # cliente singleton
│   │   ├── meta.ts             # Meta Graph API wrapper
│   │   ├── runner.ts           # opensquad child_process
│   │   ├── scheduler.ts        # node-cron (posts + squads)
│   │   └── crypto.ts           # encrypt/decrypt access tokens
│   ├── routes/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   │   └── [id]/
│   │   │   │       ├── metrics/
│   │   │   │       ├── design/
│   │   │   │       ├── posts/
│   │   │   │       ├── settings/
│   │   │   │       └── automations/
│   │   │   └── squads/
│   │   ├── api/
│   │   │   ├── meta/           # OAuth callback + Graph API proxy
│   │   │   ├── posts/          # CRUD + publicação
│   │   │   ├── metrics/        # fetch + cache
│   │   │   └── squads/         # run + schedule
│   │   └── auth/
│   └── hooks.server.ts         # auth guard
├── _workspaces/                # opensquad files (volume Docker)
├── docs/superpowers/specs/
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Deploy

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    volumes:
      - ./_workspaces:/app/_workspaces
    depends_on: [pocketbase]

  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports: ["8090:8090"]
    volumes:
      - ./pb_data:/pb/pb_data
```

**Variáveis de ambiente:**
- `POCKETBASE_URL` — URL interna do PocketBase
- `META_APP_ID` / `META_APP_SECRET` — credenciais do app Meta
- `ENCRYPTION_KEY` — chave para criptografar access tokens

**VPS workflow:** `git pull` + `docker compose up -d --build`

---

## Fases

**Fase 1 (MVP):** UI web + gestão de clientes + Meta API OAuth + criação/agendamento de posts  
**Fase 2:** Editor de design com templates, métricas avançadas  
**Fase 3:** Análise → geração de conteúdo (opensquad), marketplace de squads/templates
