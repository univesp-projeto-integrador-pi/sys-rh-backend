# 📖 RH API — Guia de Uso Completo

API RESTful para gerenciamento de recrutamento, seleção e gestão de colaboradores internos.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Autenticação](#-autenticação)
- [Perfis e Permissões](#-perfis-e-permissões)
- [Fluxo Completo de Recrutamento](#-fluxo-completo-de-recrutamento)
- [Referência de Endpoints](#-referência-de-endpoints)
  - [Auth](#auth)
  - [Vagas](#vagas-jobpositions)
  - [Candidatos](#candidatos-candidates)
  - [Candidaturas](#candidaturas-jobapplications)
  - [Departamentos](#departamentos-departments)
  - [Perfis Internos](#perfis-internos-internalprofiles)
  - [Usuários](#usuários-users)
- [Códigos de Erro](#-códigos-de-erro)
- [Segurança](#-segurança)

---

## 🎯 Visão Geral

O sistema atende dois públicos com níveis de acesso distintos:

**Público** — sem necessidade de autenticação:
- Visualizar vagas abertas
- Cadastrar candidatura com currículo
- Se candidatar a vagas disponíveis

**Interno** — requer autenticação e role adequada:
- Gerenciar vagas, candidatos e candidaturas
- Movimentar o funil de seleção
- Registrar notas e avaliações
- Gerenciar colaboradores e desligamentos
- Administrar usuários e departamentos

---

## 🔐 Autenticação

O sistema usa **JWT com Refresh Token**. O access token é enviado no header `Authorization`, e o refresh token fica em um cookie HttpOnly seguro.

### Passo a passo

#### 1. Obter token CSRF (obrigatório antes do login)

```http
GET /api/csrf-token
```

**Resposta:**
```json
{
  "csrfToken": "abc123xyz..."
}
```

Guarde esse token — ele será necessário nas rotas de refresh e logout.

---

#### 2. Criar conta

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "Senha@123"
}
```

> ⚠️ Contas criadas ficam sem permissões até um ADMIN atribuir uma role via banco de dados.

**Resposta `201`:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "role": null
}
```

**Regras de senha:**
- Mínimo 8 caracteres
- Ao menos uma letra maiúscula
- Ao menos um número
- Ao menos um caractere especial

---

#### 3. Fazer login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@empresa.com",
  "password": "Senha@123"
}
```

**Resposta `200`:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "RECRUITER"
  }
}
```

O `refreshToken` é enviado automaticamente em um **cookie HttpOnly** — não aparece no body.

---

#### 4. Usar o access token

Em todas as requisições internas, inclua o header:

```http
Authorization: Bearer eyJhbGci...
```

---

#### 5. Renovar o access token

Quando o access token expirar (24h), renove com:

```http
POST /api/auth/refresh
x-csrf-token: abc123xyz...
```

**Resposta `200`:**
```json
{
  "accessToken": "eyJhbGci..."
}
```

---

#### 6. Logout

```http
POST /api/auth/logout
x-csrf-token: abc123xyz...
```

**Resposta `204`** — sem conteúdo.

---

#### 7. Logout em todos os dispositivos

```http
POST /api/auth/logout-all
Authorization: Bearer eyJhbGci...
x-csrf-token: abc123xyz...
```

**Resposta `204`** — invalida todos os refresh tokens do usuário.

---

## 👥 Perfis e Permissões

| Role | Descrição | Como obter |
|---|---|---|
| `null` | Sem permissões | Padrão ao criar conta |
| `USER` | Acesso básico | Definido pelo ADMIN via banco |
| `VIEWER` | Somente leitura | Definido pelo ADMIN via banco |
| `RECRUITER` | Operações de recrutamento | Definido pelo ADMIN via banco |
| `ADMIN` | Acesso total | Definido pelo ADMIN via banco |

### Matriz de permissões

| Recurso | ADMIN | RECRUITER | VIEWER | USER | Público |
|---|:---:|:---:|:---:|:---:|:---:|
| Ver vagas abertas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cadastrar candidatura | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gerenciar departamentos | ✅ | ❌ | 👁️ | 👁️ | ❌ |
| CRUD de vagas | ✅ | ✅ | 👁️ | 👁️ | ❌ |
| CRUD de candidatos | ✅ | ✅ | 👁️ | 👁️ | ❌ |
| Avançar etapas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Notas internas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Perfis internos | ✅ | 👁️ | 👁️ | ❌ | ❌ |
| Desligar colaborador | ✅ | ❌ | ❌ | ❌ | ❌ |

> 👁️ = somente leitura

---

## 🔄 Fluxo Completo de Recrutamento

```
1. ADMIN cria departamento
2. RECRUITER cria vaga vinculada ao departamento
3. Candidato se cadastra (público)
4. Candidato envia currículo (público)
5. Candidato se candidata à vaga (público)
6. RECRUITER avança candidatura: APPLIED → SCREENING
7. RECRUITER adiciona notas internas e rating
8. RECRUITER avança: SCREENING → INTERVIEW → OFFER → HIRED
9. Ao chegar em HIRED: perfil interno criado automaticamente
10. ADMIN completa dados do perfil interno (cargo, gestor, etc.)
11. Futuramente: ADMIN registra desligamento se necessário
```

---

## 📚 Referência de Endpoints

### Auth

#### `GET /api/csrf-token`
Obtém o token CSRF necessário para refresh e logout.

**Resposta `200`:**
```json
{ "csrfToken": "string" }
```

---

#### `POST /api/auth/register`
Cria nova conta de usuário interno.

**Body:**
```json
{
  "name": "string (min 2 chars)",
  "email": "string (email válido)",
  "password": "string (min 8 chars, maiúscula, número, especial)"
}
```

**Respostas:** `201` criado | `400` dados inválidos | `409` email já existe

---

#### `POST /api/auth/login`
Autentica o usuário e retorna tokens.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respostas:** `200` sucesso | `401` credenciais inválidas

---

#### `POST /api/auth/refresh`
Renova o access token usando o refresh token do cookie.

**Headers obrigatórios:** `x-csrf-token`

**Respostas:** `200` novo token | `401` token inválido/expirado

---

#### `POST /api/auth/logout`
Invalida o refresh token atual.

**Headers obrigatórios:** `x-csrf-token`

**Respostas:** `204` sucesso | `401` token CSRF inválido

---

#### `POST /api/auth/logout-all`
Invalida todos os refresh tokens do usuário.

**Headers obrigatórios:** `Authorization`, `x-csrf-token`

**Respostas:** `204` sucesso | `401` não autenticado

---

### Vagas (JobPositions)

#### `GET /api/jobs/open` 🌐 Público
Lista todas as vagas com status `OPEN`.

**Resposta `200`:**
```json
[
  {
    "id": "uuid",
    "title": "Desenvolvedor Backend",
    "description": "Vaga para dev backend sênior",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00Z",
    "department": {
      "id": "uuid",
      "name": "Tecnologia"
    }
  }
]
```

---

#### `GET /api/jobs/:id` 🌐 Público
Detalhe de uma vaga específica.

**Respostas:** `200` encontrado | `404` não encontrado

---

#### `GET /api/jobs` 🔒 Autenticado
Lista todas as vagas independente do status.

---

#### `POST /api/jobs` 🔒 RECRUITER, ADMIN
Cria nova vaga.

**Body:**
```json
{
  "title": "string (min 3 chars)",
  "description": "string (opcional)",
  "departmentId": "uuid"
}
```

**Respostas:** `201` criado | `400` dados inválidos | `403` sem permissão | `404` departamento não encontrado

---

#### `PUT /api/jobs/:id` 🔒 RECRUITER, ADMIN
Atualiza dados ou status da vaga.

**Body (todos opcionais):**
```json
{
  "title": "string",
  "description": "string",
  "status": "OPEN | CLOSED | PAUSED",
  "departmentId": "uuid"
}
```

**Respostas:** `200` atualizado | `403` sem permissão | `404` não encontrado

---

#### `DELETE /api/jobs/:id` 🔒 ADMIN
Remove uma vaga permanentemente.

**Respostas:** `204` removido | `403` sem permissão | `404` não encontrado

---

### Candidatos (Candidates)

#### `POST /api/candidates` 🌐 Público
Cadastra um novo candidato.

**Body:**
```json
{
  "fullName": "string (min 2 chars)",
  "email": "string (email válido)",
  "phone": "string (10-11 dígitos, opcional)"
}
```

**Respostas:** `201` criado | `400` dados inválidos | `409` email já existe

---

#### `POST /api/candidates/:candidateId/resume` 🌐 Público
Envia ou cria o currículo do candidato.

**Body:**
```json
{
  "summary": "string (opcional)",
  "fileUrl": "string (opcional)",
  "skillIds": ["uuid", "uuid"],
  "experiences": [
    {
      "companyName": "string",
      "jobTitle": "string",
      "startDate": "2020-01-01",
      "endDate": "2023-01-01",
      "isCurrent": false,
      "description": "string (opcional)"
    }
  ],
  "educations": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string (opcional)",
      "startDate": "2016-01-01",
      "endDate": "2020-12-01"
    }
  ]
}
```

**Respostas:** `201` criado | `404` candidato não encontrado | `409` já possui currículo

---

#### `GET /api/candidates` 🔒 Autenticado
Lista todos os candidatos ativos (soft delete aplicado).

---

#### `GET /api/candidates/:id` 🔒 Autenticado
Detalhe de um candidato com currículo e perfil interno.

**Respostas:** `200` encontrado | `404` não encontrado

---

#### `GET /api/candidates/:candidateId/resume` 🔒 Autenticado
Busca o currículo completo do candidato com experiências, formações e skills.

**Respostas:** `200` encontrado | `404` não encontrado

---

#### `PUT /api/candidates/:id` 🔒 RECRUITER, ADMIN
Atualiza dados do candidato.

**Body (todos opcionais):**
```json
{
  "fullName": "string",
  "phone": "string"
}
```

> ⚠️ Email não pode ser alterado.

**Respostas:** `200` atualizado | `403` sem permissão | `404` não encontrado

---

#### `PUT /api/candidates/:candidateId/resume` 🔒 RECRUITER, ADMIN
Atualiza o currículo do candidato. Experiências e educações são substituídas completamente.

---

#### `DELETE /api/candidates/:id` 🔒 ADMIN
Soft delete — o candidato não é removido fisicamente, apenas marcado como deletado.

**Respostas:** `204` removido | `403` sem permissão | `404` não encontrado

---

### Candidaturas (JobApplications)

#### `POST /api/job-applications` 🌐 Público
Submete candidatura para uma vaga.

**Body:**
```json
{
  "candidateId": "uuid",
  "positionId": "uuid"
}
```

**Respostas:** `201` criado | `400` vaga fechada | `404` candidato/vaga não encontrado | `409` já candidatado

---

#### `GET /api/job-applications` 🔒 Autenticado
Lista todas as candidaturas ativas.

---

#### `GET /api/job-applications/:id` 🔒 Autenticado
Detalhe de uma candidatura com candidato, vaga e notas internas.

**Resposta `200`:**
```json
{
  "id": "uuid",
  "currentStage": "SCREENING",
  "appliedAt": "2024-01-01T00:00:00Z",
  "candidate": {
    "id": "uuid",
    "fullName": "Maria Souza",
    "email": "maria@email.com"
  },
  "position": {
    "id": "uuid",
    "title": "Dev Backend",
    "department": { "id": "uuid", "name": "Tecnologia" }
  },
  "notes": [
    {
      "id": "uuid",
      "content": "Ótimo perfil técnico",
      "rating": 5,
      "createdAt": "2024-01-02T00:00:00Z",
      "author": { "id": "uuid", "name": "Recrutador" }
    }
  ]
}
```

---

#### `GET /api/job-applications/candidate/:candidateId` 🔒 Autenticado
Lista todas as candidaturas de um candidato específico.

---

#### `PATCH /api/job-applications/:id/stage` 🔒 RECRUITER, ADMIN
Avança a etapa da candidatura no funil.

**Body:**
```json
{
  "currentStage": "APPLIED | SCREENING | INTERVIEW | OFFER | HIRED | REJECTED"
}
```

> ✨ Ao mudar para `HIRED`, um **perfil interno é criado automaticamente** para o candidato e uma nota de auditoria é registrada.

**Respostas:** `200` atualizado | `400` dados inválidos | `403` sem permissão | `404` não encontrado

---

#### `DELETE /api/job-applications/:id` 🔒 ADMIN
Soft delete da candidatura.

**Respostas:** `204` removido | `403` sem permissão | `404` não encontrado

---

#### `GET /api/job-applications/:applicationId/notes` 🔒 RECRUITER, ADMIN
Lista todas as notas internas de uma candidatura.

---

#### `POST /api/job-applications/:applicationId/notes` 🔒 RECRUITER, ADMIN
Adiciona nota interna a uma candidatura.

**Body:**
```json
{
  "content": "string",
  "rating": 4,
  "applicationId": "uuid",
  "authorId": "uuid"
}
```

> Rating deve ser entre 1 e 5.

**Respostas:** `201` criado | `400` rating inválido | `403` sem permissão | `404` candidatura/usuário não encontrado

---

#### `DELETE /api/job-applications/:applicationId/notes/:id` 🔒 RECRUITER, ADMIN
Remove uma nota interna.

> ⚠️ Apenas o **autor da nota** pode deletá-la. Outros recrutadores recebem `403`.

**Respostas:** `204` removido | `403` não é o autor | `404` nota não encontrada

---

### Departamentos (Departments)

#### `GET /api/departments` 🔒 Autenticado
Lista todos os departamentos.

---

#### `GET /api/departments/:id` 🔒 Autenticado
Detalhe de um departamento.

**Respostas:** `200` encontrado | `404` não encontrado

---

#### `POST /api/departments` 🔒 ADMIN
Cria novo departamento.

**Body:**
```json
{
  "name": "string"
}
```

**Respostas:** `201` criado | `403` sem permissão | `409` nome já existe

---

#### `PUT /api/departments/:id` 🔒 ADMIN
Atualiza nome do departamento.

**Body:**
```json
{
  "name": "string"
}
```

**Respostas:** `200` atualizado | `403` sem permissão | `404` não encontrado

---

#### `DELETE /api/departments/:id` 🔒 ADMIN
Remove departamento permanentemente.

**Respostas:** `204` removido | `403` sem permissão | `404` não encontrado

---

### Perfis Internos (InternalProfiles)

Gerencia colaboradores contratados. Criado automaticamente quando uma candidatura chega em `HIRED`.

#### `GET /api/internal-profiles` 🔒 Autenticado
Lista todos os perfis internos independente do status.

---

#### `GET /api/internal-profiles/active` 🔒 Autenticado
Lista apenas colaboradores com status `ACTIVE`.

---

#### `GET /api/internal-profiles/:id` 🔒 Autenticado
Detalhe de um perfil interno com candidato, departamento e gestor.

**Resposta `200`:**
```json
{
  "id": "uuid",
  "employeeCode": "EMP-001",
  "currentJobTitle": "Desenvolvedor Backend",
  "status": "ACTIVE",
  "terminatedAt": null,
  "terminationReason": null,
  "terminationNotes": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "candidate": {
    "id": "uuid",
    "fullName": "Maria Souza",
    "email": "maria@email.com"
  },
  "department": {
    "id": "uuid",
    "name": "Tecnologia"
  },
  "manager": {
    "id": "uuid",
    "employeeCode": "EMP-000",
    "currentJobTitle": "Tech Lead"
  }
}
```

---

#### `GET /api/internal-profiles/candidate/:candidateId` 🔒 Autenticado
Busca o perfil interno pelo ID do candidato.

---

#### `GET /api/internal-profiles/department/:departmentId` 🔒 Autenticado
Lista colaboradores ativos de um departamento.

---

#### `GET /api/internal-profiles/:id/subordinates` 🔒 Autenticado
Lista subordinados ativos de um gestor.

---

#### `POST /api/internal-profiles` 🔒 ADMIN
Cria perfil interno manualmente (sem precisar de candidatura `HIRED`).

**Body:**
```json
{
  "candidateId": "uuid",
  "departmentId": "uuid",
  "employeeCode": "EMP-001",
  "currentJobTitle": "Desenvolvedor Backend",
  "managerId": "uuid (opcional)"
}
```

**Respostas:** `201` criado | `400` gestor inativo | `403` sem permissão | `404` candidato/departamento/gestor não encontrado | `409` já possui perfil ou código duplicado

---

#### `PUT /api/internal-profiles/:id` 🔒 ADMIN
Atualiza dados do perfil interno.

**Body (todos opcionais):**
```json
{
  "departmentId": "uuid",
  "currentJobTitle": "string",
  "managerId": "uuid"
}
```

**Respostas:** `200` atualizado | `400` gestor inativo ou auto-referência | `403` sem permissão | `404` não encontrado

---

#### `PATCH /api/internal-profiles/:id/terminate` 🔒 ADMIN
Registra o desligamento de um colaborador.

> ✨ Ao desligar, o **candidato vinculado recebe soft delete** automaticamente.

**Body:**
```json
{
  "terminationReason": "RESIGNATION | DISMISSAL_WITH_CAUSE | DISMISSAL_WITHOUT_CAUSE | END_OF_CONTRACT | MUTUAL_AGREEMENT | RETIREMENT | OTHER",
  "terminationNotes": "string (opcional)"
}
```

**Status após desligamento:** `TERMINATED`

**Respostas:** `200` desligado | `400` já desligado | `403` sem permissão | `404` não encontrado

---

### Usuários (Users)

#### `GET /api/users` 🔒 ADMIN
Lista todos os usuários do sistema.

---

#### `GET /api/users/:id` 🔒 ADMIN
Detalhe de um usuário.

**Resposta `200`:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "role": "RECRUITER",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### `POST /api/users` 🔒 ADMIN
Cria usuário diretamente (com role definida).

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "ADMIN | RECRUITER | VIEWER | USER (opcional)"
}
```

**Respostas:** `201` criado | `403` sem permissão | `409` email já existe

---

#### `PUT /api/users/:id` 🔒 ADMIN
Atualiza dados do usuário.

**Body:**
```json
{
  "name": "string (opcional)"
}
```

---

#### `PATCH /api/users/:id/role` 🔒 ADMIN
Atualiza a role de um usuário.

**Body:**
```json
{
  "role": "ADMIN | RECRUITER | VIEWER | USER"
}
```

> ⚠️ Não é possível rebaixar o único ADMIN do sistema.

**Respostas:** `200` atualizado | `400` único ADMIN | `403` sem permissão | `404` não encontrado

---

#### `DELETE /api/users/:id` 🔒 ADMIN
Remove usuário permanentemente.

> ⚠️ Não é possível deletar o único ADMIN do sistema.

**Respostas:** `204` removido | `400` único ADMIN | `403` sem permissão | `404` não encontrado

---

## ❌ Códigos de Erro

Todos os erros seguem o mesmo formato:

```json
{
  "message": "Descrição do erro"
}
```

Erros de validação incluem detalhes dos campos:

```json
{
  "message": "Dados inválidos",
  "errors": [
    { "field": "email", "message": "Email inválido" },
    { "field": "password", "message": "Deve conter ao menos uma letra maiúscula" }
  ]
}
```

| Status | Significado |
|---|---|
| `400` | Dados inválidos ou regra de negócio violada |
| `401` | Não autenticado — token ausente ou inválido |
| `403` | Sem permissão para este recurso |
| `404` | Recurso não encontrado |
| `409` | Conflito — recurso já existe |
| `429` | Muitas requisições — rate limit atingido |
| `500` | Erro interno do servidor |

---

## 🛡️ Segurança

| Proteção | Detalhe |
|---|---|
| **Rate limit login** | Máx 10 tentativas / 15 min por IP |
| **Rate limit global** | Máx 100 requisições / 15 min por IP |
| **CSRF** | Token obrigatório nas rotas de refresh e logout |
| **XSS** | Sanitização automática em todos os campos de texto |
| **Headers HTTP** | Helmet configura CSP, X-Frame-Options e outros |
| **Senhas** | Hash bcrypt — nunca armazenadas em texto plano |
| **Tokens** | Access: 24h / Refresh: 7 dias com invalidação real |
| **IDOR** | Notas só podem ser deletadas pelo próprio autor |
| **Roles** | Definidas apenas por ADMIN — nunca pelo próprio usuário |

---

## 📖 Documentação Interativa

Com o servidor rodando, acesse o Swagger em:

```
http://localhost:3000/api-docs
```

Permite testar todos os endpoints diretamente no navegador com suporte a autenticação Bearer Token.