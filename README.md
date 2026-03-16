# Sistema de RH

[![Node Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-%5E4.18.0-blue)](https://expressjs.com/)

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- **Node.js** - Ambiente de execução JavaScript
  - Download: [https://nodejs.org/](https://nodejs.org/)
  - Recomendado: versão LTS (Long Term Support)
  
- **npm** ou **yarn** - Gerenciadores de pacotes (já vem com o Node.js)

- **Git** - Controle de versão
  - Download: [https://git-scm.com/](https://git-scm.com/)

## 🛠️ IDE Recomendada

Recomendamos o uso do **[Visual Studio Code](https://code.visualstudio.com/)** como editor de código, com as seguintes extensões úteis:

- **ES7+ React/Redux/React-Native snippets** - snippets úteis
- **Prettier** - formatador de código
- **ESLint** - identificador de erros
- **GitLens** - visualização de histórico do Git

## 🚀 Como executar o projeto

### 1. Clonar o repositório

```bash
# Clone o repositório
git clone https://github.com/univesp-projeto-integrador-pi/sys-rh-backend

```

### 2. Instalar as dependências

Com npm:
```bash
npm install
```

Ou com yarn:
```bash
yarn install
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
3. Selecione sua branch para merge na branch principal (main/master)
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

### Estrutura de pastas sugerida

```
📦 projeto
├── 📁 src/
│   ├── 📁 controllers/    # Lógica das rotas
│   ├── 📁 models/         # Modelos de dados
│   ├── 📁 routes/         # Definição de rotas
│   ├── 📁 middleware/     # Middlewares personalizados
│   ├── 📁 config/         # Configurações
│   └── 📁 utils/          # Funções utilitárias
├── 📁 tests/              # Testes automatizados
├── .env                   # Variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── package.json          # Dependências e scripts
└── README.md             # Documentação
```

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

**Desenvolvido por [Univesp Projeto Integrador](https://github.com/univesp-projeto-integrador-pi/sys-rh-backend)** 👨‍💻
```