controller department com corpo errado para fazer update, ele deve ter o campo do Id e o campo para nome, no momento, o DTO dele tem apenas um campo 

controller department retornando erro 500 para cenário onde deveria ser 404 de NOT_FOUND

=====================

o método que cria uma  vaga está inserindo registro de data para os campos de createdAt e updatedAt, comportamento inválido

bug no fluxo para se canditadar a uma vaga, a rota exige autenticação para tudo dentro do controller, como ideia de solução, separar em dois