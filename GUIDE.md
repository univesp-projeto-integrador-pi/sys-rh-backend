Aqui está a organização do README com as ferramentas separadas em seções distintas:

---

# 🚀 RH API — Documentação

---

## 📦 Gerenciador de Pacotes (npm)

### Configuração inicial

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento (com hot reload)
npm run dev

# Executar em produção
npm start
```

### Comandos úteis

| Comando | Descrição |
|---------|----------|
| `npm install` | Instala todas as dependências do projeto |
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm start` | Inicia o servidor em modo produção |

---

## 🗄️ Prisma (ORM)

### Configuração inicial

```bash
# Gerar o Prisma Client
npx prisma generate

# Rodar as migrations
npx prisma migrate dev --name init
```

### Migrations

| Comando | Descrição |
|---------|----------|
| `npx prisma migrate dev --name nome` | Cria e aplica uma nova migration |
| `npx prisma migrate reset` | Apaga tudo e recria o banco do zero |
| `npx prisma migrate deploy` | Aplica migrations pendentes em produção |

### Client e Schema

| Comando | Descrição |
|---------|----------|
| `npx prisma generate` | Gera o client TypeScript a partir do schema |
| `npx prisma validate` | Valida o schema sem conectar ao banco |
| `npx prisma format` | Formata o arquivo schema.prisma |

### Banco de dados

| Comando | Descrição |
|---------|----------|
| `npx prisma db pull` | Lê o banco e atualiza o schema |
| `npx prisma db push` | Aplica o schema sem criar arquivo de migration |
| `npx prisma studio` | Abre interface visual para ver e editar os dados |

### 🔁 Fluxo ao alterar o schema

```bash
# 1. Criar e aplicar a migration
npx prisma migrate dev --name descricao_da_mudanca

# 2. Regenerar o client TypeScript
npx prisma generate

# 3. Reiniciar o servidor
npm run dev
```

---

## 🐳 Docker

### Pré-requisitos

```bash
# Verificar instalação
docker --version
docker-compose --version
```

### Subir o banco de dados

```bash
docker compose up -d
```

### Comandos úteis

| Comando | Descrição |
|---------|----------|
| `docker compose up -d` | Constrói e inicia os containers em background |
| `docker compose logs -f` | Visualiza os logs em tempo real |
| `docker compose down` | Para os containers |
| `docker compose down -v` | Para e remove volumes (limpa o banco) |

### Estrutura do `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:15
    container_name: sys-rh-backend-db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "${POSTGRES_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network-express

volumes:
  postgres_data:

networks:
  app-network-express:
    driver: bridge
```

---

## 🔀 Git

### Comandos úteis

| Comando | Descrição |
|---------|----------|
| `git pull origin nome-da-branch` | Atualiza branch local com as alterações do remoto |
| `git branch -a` | Lista todas as branches |
| `git checkout nome-da-branch` | Muda para outra branch |
| `git branch -d nome-da-branch` | Deleta branch local |
| `git push origin --delete nome-da-branch` | Deleta branch remota |

### Trabalhando com branches

**Criar uma nova branch:**
```bash
git checkout -b nome-da-sua-branch
```

**Exemplos de nomenclatura:**
- `feature/nova-funcionalidade`
- `bugfix/corrige-erro-login`
- `hotfix/ajuste-urgente`
- `database/atualiza-schema`

**Fazer alterações e commit:**
```bash
# Verificar status
git status

# Adicionar arquivos
git add arquivo-alterado.js
git add .  # adicionar todos

# Fazer commit
git commit -m "Descrição clara das alterações"
```

**Subir para o GitHub:**
```bash
# Primeiro push (branch nova)
git push -u origin nome-da-sua-branch

# Próximos pushes
git push
```

### Padrões de commit (Conventional Commits)

| Prefixo | Descrição |
|---------|----------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `style:` | Formatação de código |
| `refactor:` | Refatoração de código |
| `test:` | Adição/atualização de testes |
| `chore:` | Tarefas de build/ferramentas |
| `database:` | Alterações no schema do banco |

### Criar Pull Request (PR)

1. Acesse o repositório no GitHub
2. Clique em **Pull requests** > **New pull request**
3. Selecione sua branch para merge na branch principal (main)
4. Preencha título e descrição do PR
5. Clique em **Create pull request**

---

## ⚙️ Configuração do Ambiente

### Variáveis de ambiente (`.env`)

```env
POSTGRES_DB=sys-rh-backend-db
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha
POSTGRES_PORT=5434

DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5434/sys-rh-backend-db"
```

---

## 🚀 Resumo rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env

# 3. Subir banco
docker compose up -d

# 4. Gerar Prisma Client
npx prisma generate

# 5. Rodar migrations
npx prisma migrate dev --name init

# 6. Iniciar aplicação
npm run dev
```

---

## 💡 Dicas extras

- Sempre execute `npx prisma generate` após alterar o schema
- Mantenha as mensagens de commit claras e seguindo os padrões
- Verifique se o Docker está rodando antes de executar `docker compose up`
- Utilize `npx prisma studio` para visualizar os dados do banco de forma interativa