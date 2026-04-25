# 📖 Guia de Estudo e Arquitetura do Projeto

Pessoal, o projeto já conta com **8 controllers** estruturados. Para que todos consigam colaborar sem quebrar a arquitetura, precisamos entender como o dado viaja desde a requisição do cliente até o banco de dados.

Precisamos identificar os problemas, anotar eles, para corrigir ou implementar coisas novas.

Minha sugestão é que cada um escolha **dois controllers** para analisar, testar e entender o fluxo completo abaixo.

## 🛠 O Fluxo da Aplicação

Seguimos uma arquitetura em camadas para manter o código organizado e fácil de testar. O caminho que uma informação percorre é:

`Client(nós estamos aqui, seja pelo navegador, postman ou ferramenta similar) -> Routes -> Middlewares -> Controllers -> Services -> Repositories -> Prisma/Database`

### 1. Routes (As Portas de Entrada)
Localizadas em `src/routes`. É aqui que o Express recebe a chamada. As rotas não têm lógica; elas apenas dizem: *"Se chegar um POST em /usuarios, chame esses Middlewares e depois este Controller"*.

### 2. Middlewares (Os Filtros)
São as camadas de segurança e validação que ficam entre a rota e o controller. 
* **Exemplo:** Validar se o token JWT é válido ou se o usuário tem permissão para acessar aquela função antes mesmo de gastar processamento no Service.

### 3. Controllers (Os Orquestradores)
Localizados em `src/controllers`. 
* **Função:** Extrair os dados da requisição (`req.body`, `req.params`), passar para o Service e devolver a resposta (`res.status(200).json(...)`).
* **Regra:** O Controller **não** sabe como salvar no banco e **não** faz cálculos de negócio.

### 4. DTOs (Data Transfer Objects)
Interfaces TypeScript que definem o "formato" dos dados que entram e saem.
* **Por que usamos?** Para garantir que o Service receba exatamente o que precisa e para que o TypeScript nos avise se esquecermos de algum campo. Eles evitam o uso do `any` e deixam o código autoexplicativo.

### 5. Services (O Coração/Regra de Negócio)
Localizados em `src/services`. 
* É aqui que a lógica acontece: *"O usuário já existe?", "A senha está correta?"*.
* Se a regra falhar, o Service lança um erro que será capturado e enviado ao cliente.

### 6. Repositories (Acesso ao Banco)
Localizados em `src/repositories`.
* Aqui fica o uso direto do **Prisma**. O objetivo é isolar o banco de dados. Se amanhã mudarmos do PostgreSQL para o MongoDB, só mexemos nos arquivos desta pasta.

### 7. Entity (A representação do Banco)
São os modelos que refletem nossas tabelas. Elas definem como o dado é estruturado dentro do banco de dados.

---

## 🚀 Script de Estudo para o Grupo

Para entenderem o projeto, sigam este roteiro com os controllers que vocês escolheram:

1.  **Localize a Rota:** Abra o arquivo em `src/routes` e veja qual Controller ele chama.
2.  **Rastreie o Controller:** Vá até o Controller e veja qual método do **Service** ele está acionando.
3.  **Analise o DTO:** Veja qual interface de dados (DTO) aquele método espera receber.
4.  **Teste na Prática:**
    * Suba o Docker (`docker-compose up -d`). Necessário garantir que tem docker, siga o passo a passo anterior
    * Abra o **Insomnia/Postman** e faça a requisição para esse Controller.
    * Mude os dados enviados para ver o que acontece quando o dado está errado (validação do DTO/Middleware).
5.  **Verifique o Banco:** Rode `npx prisma studio` e veja se a operação que você fez no teste realmente refletiu no banco de dados.

---

### Dica:
> "Não comecem a criar novos arquivos antes de entender esse fluxo!"

---