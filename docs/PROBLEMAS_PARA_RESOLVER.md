📄 RELATÓRIO DE TESTES – API (VERSÃO v1)

1. Visão Geral

Foi realizada a padronização das rotas com a inclusão do prefixo /api/v1, visando versionamento e melhor organização da API. Este relatório documenta os testes realizados, incluindo validações, falhas encontradas, correções aplicadas, comportamentos inesperados e pendências.

2. 🔐 Módulo de Autenticação
   POST /api/v1/auth/register

Status: ⚠️ Funcionando parcialmente

❌ Erro: Não está sendo possível criar usuários com perfil de Administrador.
❌ Erro: Senhas não exigem caracteres em letra minúscula (política de senha inadequada).
POST /api/v1/auth/login

Status: ✅ Funcionando

⚠️ Correção: Remover o campo "name" do payload enviado ao banco de dados (informação desnecessária).
POST /api/v1/auth/refresh

Status: ⚠️ Não testado

Motivo: Não foi possível validar o fluxo completo de autenticação.
POST /api/v1/auth/logout

Status: ⚠️ Não testado

Motivo: Não foi possível validar invalidação de sessão/token.
POST /api/v1/auth/logout-all

Status: ⚠️ Não testado

Motivo: Não foi possível validar invalidação global de sessões.
GET /api/v1/csrf-token

Status: ✅ Corrigido

✔️ Correção aplicada pelo Dev Gabriel
📁 Arquivos alterados:
server.ts
csrf-token.ts
csrf.ts
express.d.ts 3. 👤 Módulo de Candidatos
POST /api/v1/candidates-external

Status: ⚠️ Funcionando com ressalvas

⚠️ Correção: Campo telefone aceita qualquer formato (ausência de validação).
⚠️ Correção: Mínimo de caracteres do nome completo inadequado.
❌ Erro: Campo nome aceita números e caracteres especiais.
💡 Sugestão: Implementar validação de DDD por estado.
GET /api/v1/candidates-external

Status: ⚠️ Comportamento divergente

ℹ️ A funcionalidade está sendo atendida pela rota candidates-internal, exigindo autenticação via Bearer Token.
❗ Inconsistência entre rotas externas e internas.
PUT /api/v1/candidates-external

Status: ✅ Funcionando

Atualizações realizadas com sucesso.
DELETE /api/v1/candidates-external

Status: ❌ Funcionando incorretamente

Após exclusão no banco de dados:
Foi possível realizar PUT no mesmo ID (violação de integridade).
Nova tentativa de DELETE retornou 204 (No Content) ao invés de 404 (Not Found). 4. 📄 Módulo de Currículos
POST /api/v1/candidates-external/{ID}/resume

Status: ❌ Não funcionando

Erro: O candidato não é localizado pelo ID informado.
GET e DELETE (currículos)

Status: ⚠️ Não testadas

Motivo: Criação de currículos indisponível, impedindo testes. 5. 🏢 Gestão de Departamentos

Status: ✅ Funcionando corretamente

Todas as rotas operacionais.
Acesso validado com sucesso via Authorization: Bearer Token. 6. 👥 Módulo Internal Profiles

Status Geral: ⚠️ Funcionando parcialmente

✔️ Rotas funcionais:
Demais endpoints operando corretamente com autenticação via Bearer Token.
❌ Pontos de atenção:
GET /api/v1/internal-profiles/{ID}/subordinates

Status: ⚠️ Não testado

Motivo: Ausência de cenário adequado para teste.
PUT /api/v1/internal-profiles/{ID}

Status: ❌ Não funcionando corretamente

Erro: Dados enviados não sobrescrevem as informações existentes. 7. 🧪 Pendências de Testes

As seguintes funcionalidades ainda não foram testadas:

📌 Job Applications
📌 Jobs
📌 Users 8. 📌 Conclusão

A API apresenta evolução com correções aplicadas (ex: CSRF Token), porém ainda possui falhas relevantes relacionadas a validação, integridade de dados e consistência entre módulos.

🔴 Pontos críticos:
Validação insuficiente de dados (senha, nome, telefone).
Inconsistência entre rotas externas e internas.
Problemas após operações de DELETE.
Falhas em operações de UPDATE.
Funcionalidades parcialmente testadas ou bloqueadas.
✅ Recomendações:
Implementar validações robustas (DTOs e middlewares).
Padronizar respostas HTTP (404, 400, 401, etc.).
Garantir integridade após deleções.
Revisar lógica de atualização (PUT/PATCH).
Finalizar cobertura de testes pendentes.
👨‍💻 Responsáveis pelos Testes
Gabriel Sousa
Marcos
Leandro
Vitor

📅 Data: Abril/2026

=====================

controller department com corpo errado para fazer update, ele deve ter o campo do Id e o campo para nome, no momento, o DTO dele tem apenas um campo

controller department retornando erro 500 para cenário onde deveria ser 404 de NOT_FOUND

=====================

o método que cria uma vaga está inserindo registro de data para os campos de createdAt e updatedAt, comportamento inválido

bug no fluxo para se canditadar a uma vaga, a rota exige autenticação para tudo dentro do controller, como ideia de solução, separar em dois

=====================

No bancos de dados está salvando o hash, mas o campo está como password, seria bom alinhar o nome

=====================

o CandidateService para se inscrever numa vaga não está fazendo o vinculo entre um cadastro e a vaga em questão, apesar de o schema do banco de dados fazer isso, o CandidateService não está, ele apenas recebe um DTO com os dados do candidato
