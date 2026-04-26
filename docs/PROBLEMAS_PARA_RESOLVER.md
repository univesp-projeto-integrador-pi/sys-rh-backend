controller department com corpo errado para fazer update, ele deve ter o campo do Id e o campo para nome, no momento, o DTO dele tem apenas um campo 

controller department retornando erro 500 para cenário onde deveria ser 404 de NOT_FOUND

=====================

o método que cria uma  vaga está inserindo registro de data para os campos de createdAt e updatedAt, comportamento inválido

bug no fluxo para se canditadar a uma vaga, a rota exige autenticação para tudo dentro do controller, como ideia de solução, separar em dois

=====================

No bancos de dados está salvando o hash, mas o campo está como password, seria bom alinhar o nome

=====================

o CandidateService para se inscrever numa vaga não está fazendo o vinculo entre um cadastro e a vaga em questão, apesar de o schema do banco de dados fazer isso, o CandidateService não está, ele apenas recebe um DTO com os dados do candidato 