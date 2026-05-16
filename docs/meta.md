# Documento-base: Plataforma de Integração com Instagram e Facebook via API Meta

> Documento de referência consolidado a partir da documentação oficial da Meta (developers.facebook.com), focado em construir uma plataforma SaaS de publicação e agendamento para Instagram e Facebook.

\---

## 1\. Visão geral e decisão de arquitetura

A Meta oferece duas configurações distintas da Plataforma do Instagram, e a primeira decisão estratégica do seu produto é qual delas suportar (ou se vai suportar as duas, com apps separados — só é permitido **uma configuração por app**).

### Instagram API com Instagram Login (Business Login for Instagram)

* Usuário entra com credenciais do **Instagram**
* **Não exige** Página do Facebook vinculada
* Host: `graph.instagram.com`
* Token: Instagram User access token
* Escopos atuais (após depreciação de 27/01/2025):

  * `instagram\_business\_basic`
  * `instagram\_business\_content\_publish`
  * `instagram\_business\_manage\_messages`
  * `instagram\_business\_manage\_comments`
* **Limitações**: não acessa anúncios nem product tagging

### Instagram API com Facebook Login (Facebook Login for Business)

* Conta IG profissional deve estar **vinculada a uma Página do Facebook**
* Usuário deve poder executar tarefas equivalentes a administrador na Página
* Host: `graph.facebook.com`
* Token: Facebook User ou Page access token
* Escopos: `instagram\_basic`, `instagram\_content\_publish`, `instagram\_manage\_comments`, `instagram\_manage\_insights`, `instagram\_manage\_messages`, `pages\_show\_list`, `pages\_read\_engagement`
* **Vantagens extras**: insights mais completos, product tagging, Partnership Ads, integração Messenger

### Recomendação

* **SaaS multi-tenant moderno** → Instagram Login (menos pré-requisitos do cliente final)
* **Agências / e-commerce com catálogo / anúncios** → Facebook Login for Business

### Níveis de acesso

* **Standard Access**: somente contas do próprio app, sem App Review
* **Advanced Access**: servir contas de terceiros — exige App Review + Business Verification

\---

## 2\. Criação do app no Meta App Dashboard

Etapas no Dashboard:

1. Adicionar o caso de uso "Gerenciar mensagens e conteúdo no Instagram"
2. Personalizar com uma das duas configurações
3. Clicar em "Adicionar todas as permissões necessárias"
4. Gerar tokens de acesso de teste
5. Configurar webhooks (URL de retorno + verify token)
6. Configurar URL de redirecionamento OAuth
7. Cadastrar URL de desautorização e URL de solicitação de exclusão de dados
8. Para multi-tenant: marcar "Become a Tech Provider" → exige Business Verification + verificação de acesso a portfólios + App Review

### Segredos a guardar com segurança

* **Instagram App ID** + **Instagram App Secret** (Instagram Login), ou
* **Meta App ID** + **App Secret** (Facebook Login)

Esses segredos **nunca** devem trafegar para o cliente.

\---

## 3\. Fluxo de autenticação (OAuth 2.0) — Instagram Login

OAuth 2.0 com Authorization Code, em três passos.

### Passo 1 — Authorization Code

```
https://www.instagram.com/oauth/authorize
  ?client\_id=<INSTAGRAM\_APP\_ID>
  \&redirect\_uri=<SUA\_REDIRECT\_URI>
  \&response\_type=code
  \&scope=instagram\_business\_basic,instagram\_business\_manage\_messages,instagram\_business\_manage\_comments,instagram\_business\_content\_publish
  \&state=<CSRF\_TOKEN>
```

* `redirect\_uri` deve bater **exatamente** com o cadastrado no Dashboard
* `state` opcional mas recomendado (proteção CSRF)
* Parâmetros adicionais úteis:

  * `enable\_fb\_login` — exibe opção "entrar com Facebook"
  * `force\_reauth` — força digitação de credenciais
* **Sucesso**: redirect para `redirect\_uri?code=...` (válido 1 hora, uso único)
* **Cancelamento**: `error=access\_denied`, `error\_reason=user\_denied`

### Passo 2 — Short-lived token (1 hora)

```bash
curl -X POST https://api.instagram.com/oauth/access\_token \\
  -F 'client\_id=<INSTAGRAM\_APP\_ID>' \\
  -F 'client\_secret=<APP\_SECRET>' \\
  -F 'grant\_type=authorization\_code' \\
  -F 'redirect\_uri=<REDIRECT\_URI>' \\
  -F 'code=<CODE>'
```

Retorna:

```json
{
  "data": \[{
    "access\_token": "...",
    "user\_id": "...",
    "permissions": "..."
  }]
}
```

### Passo 3 — Long-lived token (60 dias)

```bash
curl -i -X GET "https://graph.instagram.com/access\_token\\
  ?grant\_type=ig\_exchange\_token\\
  \&client\_secret=<APP\_SECRET>\\
  \&access\_token=<SHORT\_LIVED\_TOKEN>"
```

⚠️ **Sempre server-side**. Nunca exponha o `client\_secret`.

### Refresh do long-lived token

```bash
curl -i -X GET "https://graph.instagram.com/refresh\_access\_token\\
  ?grant\_type=ig\_refresh\_token\\
  \&access\_token=<LONG\_LIVED\_TOKEN>"
```

**Condições**:

* Token tem ao menos 24h
* Ainda é válido
* Usuário concedeu `instagram\_business\_basic`

⚠️ Tokens não renovados em **60 dias expiram em definitivo**.

**Implementação recomendada**: worker diário que renova tokens com expiração < 7 dias.

### Facebook Login (alternativa)

* Fluxo OAuth tradicional via `graph.facebook.com/v25.0/oauth/access\_token`
* Retorna User Token
* Liste Páginas via `GET /me/accounts` para obter o **Page Access Token** (esse é o que assina chamadas em nome da Página)

\---

## 4\. Publicação de conteúdo no Instagram

Modelo de duas etapas: criar **container** → **publicar** o container.

### Endpoints principais (Instagram Login → `graph.instagram.com`)

* `POST /<IG\_ID>/media` — cria o container
* `POST /<IG\_ID>/media\_publish` — publica o container
* `GET /<IG\_CONTAINER\_ID>?fields=status\_code` — verifica status
* `GET /<IG\_ID>/content\_publishing\_limit` — checa quota atual

### Imagem única

⚠️ Mídia precisa estar em **URL pública**. Só **JPEG**. Sem filtros nem shopping tags.

```bash
POST https://graph.instagram.com/v25.0/<IG\_ID>/media
Authorization: Bearer <ACCESS\_TOKEN>
Content-Type: application/json

{
  "image\_url": "https://cdn.seudominio.com/img.jpg",
  "caption": "Texto",
  "alt\_text": "Descrição acessível"
}
```

Em seguida:

```bash
POST /<IG\_ID>/media\_publish
{ "creation\_id": "<CONTAINER\_ID>" }
```

### Vídeo / Reels

```json
{
  "media\_type": "REELS",
  "video\_url": "https://cdn.seudominio.com/video.mp4",
  "caption": "..."
}
```

Para reels-trial:

```json
{
  "trial\_params": { "graduation\_strategy": "MANUAL" }
}
```

(graduation\_strategy: `MANUAL` ou `SS\_PERFORMANCE`)

⚠️ Ao consultar `media\_type` depois, reels retornam `VIDEO`. Use `media\_product\_type` para distinguir.

### Stories

Mesmo endpoint com `media\_type=STORIES`.

### Carrossel (até 10 itens)

1. Cria N containers individuais com `is\_carousel\_item=true`
2. Cria container pai com `media\_type=CAROUSEL` e `children=<id1>,<id2>,...`
3. Publica o container pai com `media\_publish`

⚠️ Imagens recortadas com base no aspect-ratio da primeira (default 1:1).

### Upload reumível (vídeos grandes)

Principalmente no Facebook Login:

1. Container com `upload\_type=resumable`
2. `POST https://rupload.facebook.com/ig-api-upload/v25.0/<CONTAINER\_ID>`
3. Headers: `Authorization: OAuth <TOKEN>`, `offset`, `file\_size`
4. Body: binário do vídeo (`--data-binary`)
5. Alternativa: passar `file\_url` se vídeo já está hospedado

### Status do container (polling)

Polling a cada \~60s por no máximo 5 min em `GET /<CONTAINER\_ID>?fields=status\_code`:

* `EXPIRED` — passou 24h sem publicar
* `ERROR` — falhou
* `FINISHED` — pronto para publicar
* `IN\_PROGRESS` — ainda processando
* `PUBLISHED` — publicado

### Limites de publicação

* **100 posts publicados por API em janela móvel de 24h** por conta IG
* Carrossel conta como 1 post
* Consulte `GET /<IG\_ID>/content\_publishing\_limit` antes de agendar

### Partnership ads

```json
{
  "branded\_content\_sponsor\_ids": \[<id1>, <id2>],
  "is\_paid\_partnership": true
}
```

* Máximo 2 sponsors por post
* Exige `instagram\_branded\_content\_creator` ou `instagram\_basic`

\---

## 5\. Agendamento (ponto crítico do seu produto)

### Instagram: SEM agendamento nativo

⚠️ **A API do Instagram não oferece endpoint de agendamento nativo.** Toda plataforma de agendamento IG (Buffer, Later, Hootsuite, etc.) implementa o agendamento **internamente** no próprio backend.

### Arquitetura recomendada para agendamento

1. UI registra "post agendado" na base com payload completo:

   * caption
   * URLs das mídias (CDN próprio)
   * IG account ID
   * tipo de mídia
   * `scheduled\_at`
2. Worker/cron job faz polling de posts com `scheduled\_at <= now()`
3. Dispara fluxo container → media\_publish

### Boas práticas

* **Idempotência**: locks por ID + máquina de estados (PENDING → CREATING\_CONTAINER → READY → PUBLISHED/FAILED)
* **Retry exponencial** em falhas transitórias
* **Validação prévia de quota** (`content\_publishing\_limit`) antes de criar container
* **Tolerância de ±1min** (publicar no minuto exato é frágil)
* **Criar containers com no máx 23h de antecedência** (expiram em 24h)
* Ideal: criar container só alguns minutos antes do horário marcado

### Facebook Pages: COM agendamento nativo

`POST /{page\_id}/feed` aceita:

* `published=false`
* `scheduled\_publish\_time` (Unix timestamp em segundos, ISO 8601, ou string tipo `+2 weeks`)

**Janela aceita**: entre **10 minutos e 30 dias** à frente.

```bash
curl -X POST "https://graph.facebook.com/v25.0/<PAGE\_ID>/feed" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Texto do post",
    "link": "https://example.com",
    "published": "false",
    "scheduled\_publish\_time": "1735689600"
  }'
```

### Recomendação unificada

Use seu scheduler interno **para tudo** (FB e IG) — fila unificada, logs e UX consistente.

\---

## 6\. Webhooks

Webhooks reduzem chamadas (e risco de rate limit) e dão base para fluxos reativos (DMs, comentários, status de reels).

### Pré-requisitos

* App **publicado (Live)** no Dashboard
* Endpoint HTTPS com TLS válido (**sem self-signed**)

### Verificação inicial (GET)

Meta envia GET com:

* `hub.mode=subscribe`
* `hub.challenge=<int>`
* `hub.verify\_token=<seu\_token>`

Você confere o verify\_token e **responde com o `hub.challenge` em texto puro**.

### Recebimento de eventos (POST)

Payload JSON:

```json
{
  "object": "instagram",
  "entry": \[{
    "id": "...",
    "time": 1234567890,
    "changes": \[{
      "field": "comments",
      "value": { ... }
    }]
  }]
}
```

* Lote pode chegar com até 1000 itens — projete para os dois casos (1 e N)
* **Sempre responder 200 OK rapidamente**; processamento pesado vai para fila assíncrona
* Em caso de falha, Meta retenta com backoff por até 36h
* Faça **deduplicação** por chave natural do evento

### Validação de assinatura

Compute HMAC-SHA256 do **body bruto** usando seu App Secret. Compare com header `X-Hub-Signature-256` (prefixo `sha256=`).

⚠️ Sem validar, qualquer um pode forjar eventos para seu endpoint.

### Habilitação por conta

Após configurar no Dashboard, para cada conta chame:

```bash
POST /me/subscribed\_apps?subscribed\_fields=comments,messages,...\&access\_token=...
```

### Campos relevantes

* `comments`, `live\_comments`, `mentions`
* `messages`, `message\_reactions`, `message\_echoes`
* `messaging\_postbacks`, `messaging\_seen`
* `story\_insights` (só com Facebook Login)

### mTLS opcional

* Certificado CA da Meta: `meta-outbound-api-ca-2025-12.pem`
* CN: `client.webhooks.fbclientcerts.com`
* Configurável no Nginx ou AWS ALB
* Garante que **só a Meta** consegue completar o handshake

\---

## 7\. Permissões, Business Verification e App Review

### Standard Access (sem App Review)

Para contas próprias ou contas adicionadas como testers no Dashboard.

### Advanced Access (requer App Review)

Para servir clientes externos. Precisa de:

* Business Verification completa
* App marcado como Live
* Configurações preenchidas:

  * Ícone 1024×1024
  * URL de política de privacidade
  * Categoria do app
  * E-mail de negócios
* Submissão com instruções passo-a-passo **em inglês**
* Credenciais de teste para reviewers
* **Screencasts** demonstrando uso end-to-end de **cada permissão**
* Para algumas permissões: pelo menos 1 chamada bem-sucedida já feita

### Erros comuns que causam reprovação

* Pedir permissões além do uso real
* Screencasts sem narração/legenda
* Falta da etapa de Facebook Login visível
* Não demonstrar valor para o usuário final

### Migração FB Login → IG Login

Pode receber Advanced Access automaticamente em permissões equivalentes:

* `instagram\_basic` → `instagram\_business\_basic`
* `instagram\_content\_publishing` → `instagram\_business\_content\_publishing`
* `instagram\_manage\_comments` → `instagram\_business\_manage\_comments`
* `instagram\_manage\_messages` → `instagram\_business\_manage\_messages`

Só submeta para App Review se o status não migrar sozinho.

\---

## 8\. Rate limiting

### Instagram Business Use Case

Por par (app × usuário do app) em janela móvel de 24h:

```
Calls = 4800 × impressões
```

"impressões" = nº de vezes que conteúdo da conta apareceu na tela de pessoas nas últimas 24h.

⚠️ Contas pequenas têm limite muito baixo — minimize chamadas (cache, webhooks).

### Mensagens

* **Conversations API**: 2/s por conta
* **Send API**:

  * 100/s por conta para texto/links/reações/stickers
  * 10/s para áudio/vídeo
* **Private Replies**:

  * 100/s por conta em comentários de Lives
  * 750/h por conta em comentários de posts e reels

### Publishing

**100 posts publicados / 24h por conta IG.**

### Business Discovery e Hashtag Search

Seguem Platform Rate Limit padrão (não Business Use Case).

### Boas práticas

* Armazene header `X-Business-Use-Case-Usage` (ou `X-App-Usage`)
* Exponha em dashboard de saúde por cliente
* Backoff exponencial em HTTP 4 (Application limit) e 17 (User request limit)
* Enfileire e priorize

\---

## 9\. Endpoint /me e identificadores

* `/me` resolve para o ID dono do token corrente
* Em multi-tenant, salvar e usar `<IG\_ID>` explícito é mais previsível
* Comentários e DMs externos vêm com **Instagram-scoped User ID** (ou Page-scoped no FB Login)
* Esse ID é **estável dentro do escopo** do seu app + conta IG envolvida
* **Não é** o ID público do Instagram da pessoa
* ⚠️ Não tente cruzar IDs com APIs externas

\---

## 10\. Modelo de dados sugerido

### Entidades principais

**Organization** — cliente da sua plataforma

* Possui usuários e contas sociais

**SocialAccount** — conta IG ou FB Page conectada

* `provider` (instagram | facebook)
* `external\_id`
* `username`
* `access\_token` (criptografado em repouso)
* `token\_expires\_at`
* `refresh\_strategy`
* `scopes`
* `status`

**MediaAsset** — arquivos do usuário

* URL pública no seu CDN (a Meta precisa cURL-ar)
* `mime\_type`, `width/height/duration`, `checksum`

**ScheduledPost**

* `social\_account\_id`
* `media\_type` (IMAGE | VIDEO | REELS | STORIES | CAROUSEL)
* `assets\[]`
* `caption`, `alt\_text`
* `scheduled\_at`
* `state` (DRAFT | SCHEDULED | CREATING\_CONTAINER | READY | PUBLISHING | PUBLISHED | FAILED | CANCELED)
* `container\_id`, `published\_media\_id`
* `attempts`, `last\_error`

**WebhookEvent** — log bruto + status de processamento (auditoria e replays)

**RateLimitUsage** — snapshot por conta e endpoint

### Camadas do app

1. **API / UI**
2. **Service layer** — orquestra publicação, agendamento, OAuth
3. **Adapters** — `InstagramClient`, `FacebookPageClient` encapsulando endpoints
4. **Workers / Schedulers** — publicação, refresh de token, retry, dedupe de webhook
5. **Storage** — Postgres + Redis (filas) + S3/Cloudfront (mídia)

\---

## 11\. Boas práticas e armadilhas comuns

* **Tokens como segredo**: criptografe em repouso, nunca logue
* **App Secret jamais em código cliente**
* **Mídia via CDN**: URLs longas e idempotentes (se URL mudar entre `media` e `media\_publish`, Meta falha)
* **Vídeos/Reels**: valide aspect ratio (9:16 recomendado), bitrate, duração e codec antes de subir
* **Containers expiram em 24h** — limpe os pendentes
* **PPA (Page Publishing Authorization)**: armadilha clássica no FB Login — oriente clientes a completar proativamente
* **LGPD/GDPR**: implemente URLs de desautorização e exclusão de dados com handlers reais
* **Endpoint de reconexão**: para quando token expira ou usuário revoga permissões
* **Chat automatizado**: informe legalmente (Califórnia, Alemanha) que é bot

\---

## 12\. Próximos passos sugeridos

1. **Criar app de testes** no Dashboard com Instagram Login + conta IG profissional sua. Completar OAuth manualmente via cURL/Postman para validar `client\_id`, `client\_secret`, `redirect\_uri` e scopes.
2. **Implementar adapter `InstagramClient`** com métodos:

   * `exchangeCodeForToken`
   * `exchangeForLongLived`
   * `refreshLongLived`
   * `createMediaContainer`
   * `createCarouselContainer`
   * `getContainerStatus`
   * `publishContainer`
   * `getPublishingLimit`
3. **Implementar scheduler** com fila persistente + máquina de estados em `ScheduledPost`.
4. **Implementar servidor de webhooks**:

   * Verify request
   * Validate signature
   * Enqueue para processamento assíncrono
   * Começar pelos campos `comments` e `messages`
5. **Conectar UI básica** de "agendar post" + testes end-to-end com sua conta.
6. **Só então preparar submissão para App Review** (com screencasts e instruções) para liberar Advanced Access e atender outros clientes.

\---

## Referências oficiais

* Overview da Plataforma do Instagram: https://developers.facebook.com/docs/instagram-platform/overview
* Create an App: https://developers.facebook.com/docs/instagram-platform/create-an-instagram-app
* Instagram API with Instagram Login: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
* Business Login for Instagram: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
* Publish Content: https://developers.facebook.com/docs/instagram-platform/content-publishing
* Webhooks: https://developers.facebook.com/docs/instagram-platform/webhooks
* App Review: https://developers.facebook.com/docs/instagram-platform/app-review
* Referência da API: https://developers.facebook.com/docs/instagram-platform/reference
* Mídia do Instagram: https://developers.facebook.com/docs/instagram-platform/reference/instagram-media
* Posts em Páginas do Facebook: https://developers.facebook.com/docs/pages-api/posts

\---

*Documento gerado em 2026-05-16 a partir da documentação oficial da Meta.*

