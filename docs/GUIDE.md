# 🚀 RH API — GUIDE

---

## 🛠️ Instalação e Configuração

Siga os passos abaixo para colocar o projeto em execução:

### 1. Clonar o repositório
```bash
git clone https://github.com/univesp-projeto-integrador-pi/sys-rh-backend
cd sys-rh-backend
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto e configure as credenciais conforme o exemplo abaixo:
> **Nota:** Nunca comite o arquivo `.env`.

```env
# Banco de Dados
POSTGRES_DB=rh_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_PORT=5434
DATABASE_URL="postgresql://admin:sua_senha_segura@localhost:5434/rh_db"

# Autenticação (Gere chaves com: openssl rand -base64 64)
JWT_ACCESS_SECRET=sua_chave_access
JWT_REFRESH_SECRET=sua_chave_refresh
JWT_ACCESS_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Segurança e Ambiente
CSRF_SECRET=sua_chave_csrf
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
```

### 3. Subir o Banco de Dados (Docker)
```bash
docker compose up -d # para funcionar, o comando tem que ser rodado dentro da pasta que está o docker-compose.yaml
```

### 4. Instalar Dependências e Migrations
```bash
# Instalar pacotes
npm install

# Gerar Prisma Client e aplicar banco
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Iniciar a Aplicação
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run start
```

---

## 📖 Guia de Referência

### 🗄️ Prisma (ORM)
| Comando | Descrição |
|---------|----------|
| `npx prisma migrate dev` | Cria e aplica uma nova migration |
| `npx prisma db push` | Sincroniza o schema sem criar arquivos de migration |
| `npx prisma studio` | Abre a interface visual para gerenciar dados |
| `npx prisma format` | Formata o arquivo `schema.prisma` |

### 🐳 Docker
| Comando | Descrição |
|---------|----------|
| `docker compose logs -f` | Visualiza os logs dos containers |
| `docker compose down` | Para os serviços |
| `docker compose down -v` | Para e **deleta** os dados do banco |

---

## 🔀 Fluxo de Contribuição e Git

Para manter o projeto organizado, seguimos o padrão de **Conventional Commits**.

### Nomenclatura de Branches
- `feature/nome-da-feature`
- `bugfix/descrição-do-erro`
- `docs/ajuste-documentacao`
- `refactor/melhoria-codigo`

### Comandos Git Recomendados
```bash
# Criar nova branch e mudar para ela
git checkout -b feature/minha-feature

# Adicionar e Commitar
git add .
git commit -m "feat: adiciona integração com serviço X"

# Enviar para o repositório
git push -u origin feature/minha-feature
```

### Padrões de Commit
| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Mudanças na documentação |
| `style:` | Formatação (espaços, vírgulas) |
| `refactor:` | Mudança de código que não corrige erro nem add feature |
| `chore:` | Atualização de tarefas de build ou pacotes |

---

## 💡 Dicas Úteis

* **Alterou o banco?** Sempre execute `npx prisma generate` após mudar o `schema.prisma` para atualizar as tipagens do TypeScript.
* **Interface Visual:** O Prisma Studio (`npx prisma studio`) é a forma mais rápida de validar se os dados foram inseridos corretamente no banco local.
* **Logs:** Se a API não conectar ao banco, use `docker compose logs -f` para verificar se o PostgreSQL subiu corretamente na porta definida.