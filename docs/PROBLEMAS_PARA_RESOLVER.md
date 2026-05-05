# 📄 RELATÓRIO DE TESTES – API (VERSÃO v1)

## 1. Visão Geral

Foi realizada a padronização das rotas com a inclusão do prefixo **/api/v1**, visando versionamento e melhor organização da API. A seguir, estão documentados os resultados dos testes realizados nas rotas, incluindo erros encontrados, correções necessárias e sugestões de melhoria.

---

## 2. 🔐 Módulo de Autenticação

### **POST /api/v1/auth/register**

**Status:** ⚠️ Funcionando parcialmente

* ❌ **Erro:** Não está sendo possível criar usuários com perfil de Administrador.
* ❌ **Erro:** Senhas não exigem caracteres em letra minúscula (falta validação adequada).

---

### **POST /api/v1/auth/login**

**Status:** ✅ Funcionando

* ⚠️ **Correção:** Remover o campo `"name"` do JSON enviado ao banco de dados, pois trata-se de informação desnecessária.

---

### **POST /api/v1/auth/refresh**

**Status:** ⚠️ Não testado

* Motivo: Não foi possível realizar testes.

---

### **POST /api/v1/auth/logout**

**Status:** ⚠️ Não testado

* Motivo: Não foi possível realizar testes.

---

### **POST /api/v1/auth/logout-all**

**Status:** ⚠️ Não testado

* Motivo: Não foi possível realizar testes.

---

### **GET /api/v1/csrf-token**

**Status:** ❌ Não funcionando

* Erro: A rota não retorna o token esperado.

---

## 3. 👤 Módulo de Candidatos

### **POST /api/v1/candidates-external**

**Status:** ⚠️ Funcionando com ressalvas

* ⚠️ **Correção:** O campo telefone aceita qualquer formato (falta validação).
* ⚠️ **Correção:** O nome completo possui limite mínimo de caracteres muito baixo.
* ❌ **Erro:** O campo nome aceita números e caracteres especiais indevidamente.
* 💡 **Sugestão:** Implementar validação de DDD com base no estado.

---

### **GET /api/v1/candidates-external**

**Status:** ❌ Não funcionando

* Erro: Rota não encontrada.

---

### **PUT /api/v1/candidates-external**

**Status:** ✅ Funcionando

* Todas as atualizações de campos foram realizadas com sucesso.

---

### **DELETE /api/v1/candidates-external**

**Status:** ❌ Funcionando incorretamente

* Após exclusão de um usuário no banco de dados:

  * Foi possível realizar um **PUT** no mesmo ID (comportamento incorreto).
  * Ao tentar deletar novamente, a API retornou **204 (No Content)** ao invés de indicar que o usuário não existe.

---

## 4. 📄 Módulo de Currículos

### **POST /api/v1/candidates-external/{ID}/resume**

**Status:** ❌ Não funcionando

* Erro: O sistema não localiza o candidato pelo ID informado.

---

### **GET e DELETE (currículos)**

**Status:** ⚠️ Não testadas

* Motivo: Não foi possível criar currículos, impossibilitando os testes.

---

## 5. 📌 Conclusão

A API apresenta funcionamento parcial, com diversas rotas operacionais, porém com falhas relevantes em validações, integridade de dados e controle de erros.

### 🔴 Pontos críticos:

* Falta de validação adequada em campos sensíveis (senha, nome, telefone).
* Problemas de consistência após operações de DELETE.
* Rotas não funcionais ou inexistentes.
* Impossibilidade de testar partes importantes do sistema.

### ✅ Recomendações:

* Priorizar correções de validação e integridade de dados.
* Ajustar retorno de erros conforme boas práticas HTTP.
* Garantir funcionamento completo das rotas antes de evolução da API.

---

## 👨‍💻 Responsáveis pelos Testes

* Gabriel Sousa
* Marcos
* Leandro
* Vitor

---

**📅 Data:** Abril/2026


controller department com corpo errado para fazer update, ele deve ter o campo do Id e o campo para nome, no momento, o DTO dele tem apenas um campo 

controller department retornando erro 500 para cenário onde deveria ser 404 de NOT_FOUND

=====================

o método que cria uma  vaga está inserindo registro de data para os campos de createdAt e updatedAt, comportamento inválido

bug no fluxo para se canditadar a uma vaga, a rota exige autenticação para tudo dentro do controller, como ideia de solução, separar em dois

=====================

No bancos de dados está salvando o hash, mas o campo está como password, seria bom alinhar o nome

=====================

o CandidateService para se inscrever numa vaga não está fazendo o vinculo entre um cadastro e a vaga em questão, apesar de o schema do banco de dados fazer isso, o CandidateService não está, ele apenas recebe um DTO com os dados do candidato 
