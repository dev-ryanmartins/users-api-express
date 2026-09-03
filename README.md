# Users API

API RESTful assíncrona construída com Node.js, Express e TypeScript para gerenciar usuários. O projeto foi estruturado como um exemplo de portfólio: separa rotas, controladores, validação, persistência e tratamento de erros, sem depender de um banco de dados externo.

## Tecnologias

- Node.js 24 e TypeScript
- Express 5
- Zod para validação de entradas
- Pino para logs estruturados
- Persistência local em `artifacts/api-server/data/users.json`
- pnpm workspaces

## Como executar

### Pré-requisitos

- Node.js 24 ou superior
- pnpm 10 ou superior

### Instalação

Na raiz do projeto:

```bash
pnpm install
```

Copie as variáveis de ambiente de exemplo:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

Inicie em desenvolvimento, com reconstrução automática:

```bash
pnpm --filter @workspace/api-server run dev
```

Para iniciar em modo normal:

```bash
pnpm --filter @workspace/api-server start
```

O servidor utiliza `PORT` quando essa variável é fornecida pelo ambiente. No workflow do Replit, a URL base é `/api`.

## Endpoints

Todos os endpoints retornam JSON, exceto exclusões bem-sucedidas, que retornam `204 No Content`.

### Health check

```http
GET /api/healthz
```

Resposta:

```json
{
  "status": "ok"
}
```

### Listar usuários

```http
GET /api/users?page=1&limit=10&search=ana&active=true
```

Parâmetros opcionais:

| Parâmetro | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `page` | inteiro | `1` | Página atual |
| `limit` | inteiro | `10` | Itens por página, de 1 a 100 |
| `search` | texto | — | Busca por nome ou e-mail |
| `active` | `true`/`false` | — | Filtra pelo status |

Resposta:

```json
{
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Ana Souza",
      "email": "ana.souza@example.com",
      "active": true,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Buscar usuário

```http
GET /api/users/:id
```

### Criar usuário

```http
POST /api/users
Content-Type: application/json
```

Body:

```json
{
  "name": "Carlos Lima",
  "email": "carlos.lima@example.com",
  "active": true
}
```

`active` é opcional e assume `true`.

### Atualizar usuário

```http
PATCH /api/users/:id
Content-Type: application/json
```

Envie um ou mais campos:

```json
{
  "name": "Carlos Lima Jr.",
  "active": false
}
```

### Deletar usuário

```http
DELETE /api/users/:id
```

## Erros

As falhas seguem um formato consistente:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Os dados enviados são inválidos.",
    "details": [
      {
        "field": "email",
        "message": "Informe um e-mail válido."
      }
    ]
  }
}
```

Códigos comuns:

- `400 VALIDATION_ERROR`: entrada inválida
- `404 USER_NOT_FOUND`: usuário inexistente
- `404 ROUTE_NOT_FOUND`: rota inexistente
- `409 EMAIL_ALREADY_EXISTS`: e-mail duplicado
- `500 INTERNAL_SERVER_ERROR`: erro inesperado

## Testando com curl

```bash
curl http://localhost:8080/api/healthz

curl http://localhost:8080/api/users

curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Marina Alves","email":"marina.alves@example.com"}'
```

No preview do Replit, use a URL pública do ambiente com o mesmo caminho `/api`.

## Estrutura

```text
artifacts/api-server/
├── data/users.json              # persistência local
├── src/controllers/users.ts     # casos de uso HTTP
├── src/lib/user-store.ts        # leitura, escrita e fila de gravação
├── src/middlewares/             # validação e erros
├── src/routes/                  # composição das rotas
├── src/schemas/user.ts          # contratos de entrada
└── src/index.ts                 # inicialização do servidor
```

O arquivo `lib/api-spec/openapi.yaml` é a referência do contrato público e pode gerar os clientes compartilhados do workspace:

```bash
pnpm --filter @workspace/api-spec run codegen
```