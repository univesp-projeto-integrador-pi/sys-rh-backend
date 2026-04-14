# 🏗️ Documentação Técnica: Arquitetura API REST & JSON

Este documento detalha o funcionamento de uma Interface de Programação de Aplicações baseada no estilo arquitetural REST, utilizando o formato JSON como meio de comunicação.

-----

## 🧐 Definições Técnicas

### **API (Application Programming Interface)**

**Termo Técnico:** É um conjunto de rotinas, protocolos e ferramentas que estabelece uma interface de comunicação entre componentes de software distintos. Ela define as entradas (*requests*) e saídas (*responses*) permitidas, permitindo que um sistema utilize funcionalidades de outro sem conhecer sua implementação interna.

### **REST (Representational State Transfer)**

**Termo Técnico:** Estilo arquitetural de rede que utiliza o protocolo HTTP. Uma API é **RESTful** quando segue restrições como: ser *Stateless* (sem estado), possuir *Interface Uniforme* e utilizar métodos padrões (GET, POST, PUT, DELETE).

### **JSON (JavaScript Object Notation)**

**Termo Técnico:** Formato leve de troca de dados entre sistemas, baseado em texto e independente de linguagem. É a estrutura de "chave e valor" que permite que o Cliente e o Servidor se entendam.

-----

## 🥪 As Analogias: Do Drive-Thru ao Formulário

  * **A API e o REST (O Atendimento):** Imagine um Drive-Thru. A **API** é o cardápio e o guichê; você não entra na cozinha, apenas interage com a interface. O **REST** é o protocolo: o atendente espera que você diga "Eu quero (GET) o lanche X". Ele não lembra do seu pedido anterior (*Stateless*).
  * **O JSON (O Pedido):** É o **Formulário de Papel**. O banco te entrega um papel com campos fixos: `Nome: ________`. O JSON é esse formulário preenchido: `{"nome": "Danilo"}`. É o idioma que leva a informação do guichê para a cozinha.

-----

## 🛠️ Arquitetura Interna (Express + Prisma + PostgreSQL)

A API é dividida em camadas para separar responsabilidades e facilitar a manutenção:

| Camada | Função Técnica | Papel do JSON |
| :--- | :--- | :--- |
| **Routes** | Define os *endpoints* e associa o método HTTP ao controlador. | Identifica o recurso (ex: `/users`). |
| **Controllers** | Orquestrador. Extrai dados da requisição e envia a resposta. | Recebe o `req.body` (JSON) e envia o `res.json()`. |
| **Services** | Onde mora a lógica de negócio e as validações. | Valida as informações contidas no objeto JSON. |
| **Repositories** | Usa o **Prisma** para realizar o CRUD no banco. | Traduz o objeto do código para dados do Banco. |
| **Database** | **PostgreSQL**: Onde os dados são persistidos. | Armazenamento final dos dados. |

-----

## 📊 Fluxo de Dados Completo

1.  **Client:** Envia um **JSON** via `POST /users`.
2.  **Routes:** Direciona para o `CreateUserController`.
3.  **Controller:** Transforma o **JSON** em um objeto de código e chama a **Service**.
4.  **Service:** Verifica as regras (ex: e-mail duplicado) e chama o **Repository**.
5.  **Repository:** Usa o **Prisma** para salvar no **PostgreSQL**.
6.  **Response:** O Controller recebe o resultado, transforma em um novo **JSON** de sucesso e envia ao Cliente com o Status `201 Created`.

-----

## 📚 Referências para Estudo

### **API & REST**

  * [Restful API Design Guide](https://restfulapi.net/)
  * [MDN HTTP Methods](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Methods)
  * [HTTP Status Cats](https://http.cat/) (Para decorar os códigos de erro\!)

### **JSON & Ferramentas**

  * [JSON.org](https://www.json.org/json-pt.html) - Sintaxe oficial.
  * [JSONLint](https://jsonlint.com/) - Validador de arquivos JSON.
  * [Express Middleware](https://www.google.com/search?q=https://expressjs.com/en/api.html%23express.json) - Como o Node lê JSON.

-----