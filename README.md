# Sistema de RH

[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-%3E%3D5.0.0-blue)](https://expressjs.com/)
[![Prisma Version](https://img.shields.io/badge/prisma-latest-blue)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/docker-supported-blue)](https://www.docker.com/)

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- **Node.js** - Ambiente de execução JavaScript
  - Download: [https://nodejs.org/](https://nodejs.org/)
  - Recomendado: versão LTS (Long Term Support)
  
- **npm** ou **yarn** - Gerenciadores de pacotes (já vem com o Node.js)

- **Git** - Controle de versão
  - Download: [https://git-scm.com/](https://git-scm.com/)

- **Docker** e **Docker Compose** (opcional, para execução containerizada)
  - Download: [https://www.docker.com/](https://www.docker.com/)

## 🛠️ IDE Recomendada

Recomendamos o uso do **[Visual Studio Code](https://code.visualstudio.com/)** como editor de código, com as seguintes extensões úteis:

- **ES7+ React/Redux/React-Native snippets** - snippets úteis
- **Prettier** - formatador de código
- **ESLint** - identificador de erros
- **GitLens** - visualização de histórico do Git
- **Prisma** - extensão oficial para suporte ao Prisma ORM

## 🚀 Como executar o projeto

### 1. Clonar o repositório

```bash
# Clone o repositório
git clone https://github.com/univesp-projeto-integrador-pi/sys-rh-backend
cd sys-rh-backend
```

### 2. Configurar variáveis de ambiente

```bash
# Edite o arquivo .env com suas configurações
# Configure a DATABASE_URL com a URL do seu PostgreSQL
```

### 3. Instalar as dependências

Com npm:
```bash
npm install
```

Ou com yarn:
```bash
yarn install
```

### 4. Configurar o banco de dados

```bash
# Executar migrações do Prisma
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate
```

### 5. Executar a aplicação

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## 🐳 Executando com Docker

### Pré-requisitos do Docker

Certifique-se de ter Docker e Docker Compose instalados em sua máquina:

```bash
# Verificar instalação
docker --version
docker-compose --version
```

### Método 1: Docker Compose (Recomendado)

O projeto inclui um `docker-compose.yml` que orquestra a aplicação e o banco de dados PostgreSQL:

```bash
# Construir e iniciar os containers
docker compose up -d

# Verificar logs
docker compose logs -f

# Parar os containers
docker compose down

# Parar e remover volumes (banco de dados será limpo)
docker compose down -v
```

### Método 2: Dockerfile manual

```bash
# Construir a imagem
docker build -t sys-rh-backend .

# Executar o container (necessário ter PostgreSQL rodando)
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e NODE_ENV=production \
  sys-rh-backend
```

### Configuração do Docker Compose

O arquivo `docker-compose.yml` inclui:

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

## 📊 Modelo de Dados (Prisma ORM)

O sistema utiliza o Prisma como ORM (Object-Relational Mapping) com as seguintes entidades principais:

### 🧑‍💼 Entidades de Usuário e RH

| Entidade | Descrição | Principais Campos |
|----------|-----------|-------------------|
| **User** | Usuários do sistema que podem criar notas internas | id, name, email, createdAt, updatedAt |
| **InternalProfile** | Perfil de funcionário interno vinculado a um candidato | employeeCode, currentJobTitle, department, manager |

### 🎯 Entidades de Recrutamento

| Entidade | Descrição | Principais Campos |
|----------|-----------|-------------------|
| **Candidate** | Candidatos a vagas com suporte a soft delete | fullName, email, phone, deletedAt |
| **Resume** | Currículo do candidato (1:1 com Candidate) | summary, fileUrl, rawText |
| **Skill** | Habilidades técnicas/comportamentais | name (único) |
| **ResumeSkill** | Relação N:N entre currículos e habilidades | resumeId, skillId |

### 📝 Entidades de Carreira e Educação

| Entidade | Descrição | Principais Campos |
|----------|-----------|-------------------|
| **ProfessionalExperience** | Experiências profissionais do candidato | companyName, jobTitle, startDate, endDate, isCurrent |
| **Education** | Formação acadêmica | institution, degree, fieldOfStudy, startDate, endDate |

### 🏢 Entidades Organizacionais

| Entidade | Descrição | Principais Campos |
|----------|-----------|-------------------|
| **Department** | Departamentos da empresa | name (único) |
| **JobPosition** | Vagas disponíveis | title, description, status (OPEN/CLOSED/PAUSED) |

### 📋 Entidades de Processo Seletivo

| Entidade | Descrição | Principais Campos |
|----------|-----------|-------------------|
| **JobApplication** | Candidatura a uma vaga | currentStage (APPLIED/SCREENING/INTERVIEW/OFFER/HIRED/REJECTED) |
| **InternalNote** | Notas internas sobre candidaturas | content, rating, author |

### 📈 Diagrama de Relacionamentos

```
User ──┐
       ├── InternalNote ──┐
Candidate ──┤              │
       ├── Resume ────────┤
       │   ├── ProfessionalExperience
       │   ├── Education
       │   └── ResumeSkill ── Skill
       │
       └── JobApplication ──┬── JobPosition ── Department
                            └── InternalNote ── User
```

### 🔄 Migrações e Schemas

```bash
# Criar nova migração após alterar o schema.prisma
npx prisma migrate dev --name descricao_da_mudanca

# Resetar banco de dados (útil para desenvolvimento)
npx prisma migrate reset

# Visualizar dados no banco
npx prisma studio
```

## 📚 Sobre o Express

[Express](https://expressjs.com/) é um framework para Node.js que fornece recursos mínimos para construção de servidores web. Algumas características:

- **Roteamento** - Definição de rotas HTTP
- **Middleware** - Funções que têm acesso ao req/res
- **Templates** - Suporte a engines de template (EJS, Pug, etc.)
- **Alta performance** - Leve e rápido

## 🌿 Trabalhando com branches

### Criar uma nova branch

```bash
# Criar e mudar para nova branch
git checkout -b nome-da-sua-branch

# Exemplos de nomes de branch:
# feature/nova-funcionalidade
# bugfix/corrige-erro-login
# hotfix/ajuste-urgente
# database/atualiza-schema
```

### Fazer alterações e commit

```bash
# Verificar status das alterações
git status

# Adicionar arquivos específicos
git add arquivo-alterado.js

# Ou adicionar todos os arquivos
git add .

# Fazer commit com mensagem descritiva
git commit -m "Descrição clara das alterações realizadas"
```

### Subir alterações para o GitHub

```bash
# Primeiro push (para branch nova)
git push -u origin nome-da-sua-branch

# Próximos pushes (já configurado)
git push
```

### Criar Pull Request (PR)

1. Acesse o repositório no GitHub
2. Clique em "Pull requests" > "New pull request"
3. Selecione sua branch para merge na branch principal (main)
4. Preencha título e descrição do PR
5. Clique em "Create pull request"

## 💡 Dicas extras

### Comandos úteis do Git

```bash
# Atualizar branch local com as alterações do remoto
git pull origin nome-da-branch

# Ver branches existentes
git branch -a

# Mudar para outra branch
git checkout nome-da-branch

# Deletar branch local
git branch -d nome-da-branch

# Deletar branch remota
git push origin --delete nome-da-branch
```

### Padrões de commit (Conventional Commits)

- `feat:` - nova funcionalidade
- `fix:` - correção de bug
- `docs:` - documentação
- `style:` - formatação de código
- `refactor:` - refatoração de código
- `test:` - adição/atualização de testes
- `chore:` - tarefas de build/ferramentas
- `database:` - alterações no schema do banco de dados

### Estrutura de pastas sugerida

```
📦 sys-rh-backend
├── 📁 prisma/
│   ├── schema.prisma      # Definição do modelo de dados
│   └── migrations/        # Migrações do banco de dados
├── 📁 src/
│   ├── 📁 controllers/    # Lógica das rotas
│   ├── 📁 services/       # Regras de negócio
│   ├── 📁 routes/         # Definição de rotas
│   ├── 📁 middleware/     # Middlewares personalizados
│   ├── 📁 config/         # Configurações
│   └── 📁 utils/          # Funções utilitárias
├── 📁 tests/              # Testes automatizados
├── .env                   # Variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── docker-compose.yml    # Configuração do Docker Compose
├── package.json          # Dependências e scripts
└── README.md             # Documentação
```

### 🔧 Comandos Prisma úteis

```bash
# Abrir interface visual do Prisma Studio
npx prisma studio

# Gerar cliente Prisma
npx prisma generate

# Criar nova migração
npx prisma migrate dev

# Aplicar migrações em produção
npx prisma migrate deploy

# Visualizar schema no formato PRISMA
npx prisma format
```

---

**Desenvolvido por [Univesp Projeto Integrador](https://github.com/univesp-projeto-integrador-pi)** 👨‍💻
