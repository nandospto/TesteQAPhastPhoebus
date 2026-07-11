# Plano de testes

```gherkin
Funcionalidade: Validação do EndPoint do cadatro de Pet (REQ-01)
    Como um analista de qualidade
    Quero enviar uma requisição POST com os parâmetros id, name e status
    Para garantir que API processe, armazene e retorne os dados corretamente

    Contexto: Variáveis da Collection criadas
        Dado que o payload "meuBody" foi criado na collection de teste
        E os valores e tipos dentro dessa payload são  "idRNG", "nameRNG" e "statusRNG" são aleatórios

    Cenário: [API] Criar um Pet com sucesso via POST (Caminho Feliz)
        Dado o payload "meuBody" da collection com as variáveis "idRNG", "nameRNG" e "statusRNG" com tipagem e valores corretos
        Quando a requisição POST é disparada para o EndPoint
        Então o status code retornado deve ser 200
        E o body do response deve conter exatamente os mesmos valores enviados

    Cenário: [API] Validar erro ao enviar payload com o "idRNG" com um tipo diferente de 'number' (Caminho Triste)
        Dado que a variável "idRNG" esteja com um tipo de dado diferente de 'number'
        Quando envio a requisição POST para o endpoint
        Então o status code retornado deve ser 500

    Cenário: [API] Validar erro ao enviar payload com o "nameRNG" com um tipo diferente de 'string' (Caminho Triste)
        Dado que a variável "nameRNG" esteja com um tipo de dado diferente de 'string'
        Quando envio a requisição POST para o endpoint
        Então o status code retornado deve ser 400

    Cenário: [API] Validar erro ao enviar payload com o "statusRNG" com um tipo diferente de 'string' (Caminho Triste)
        Dado que as variáveis "statusRNG" estejam com um tipo de dado diferente de 'string'
        Ou a variável não está presente no array dado pelas strings "available", "pending" e "sold"
        Quando envio a requisição POST para o endpoint
        Então o status code retornado deve ser 400

Funcionalidade: Validação do EndPoint da pesquisa do Pet criado (REQ-02)
    Como um analista de qualidade
    Quero enviar uma requisição GET com os parâmetros id, name e status feitos na REQ-01
    Para garantir que API busque e retorne os dados corretamente

    Contexto: Variáveis da Collection criadas
        Dado que o payload "meuBody" foi criado na collection de teste depois do POST
        E os valores e tipos dentro dessa payload são  "idRNG", "nameRNG" e "statusRNG" são aleatórios
        E a variável da collection "petIdGet" que varia entre o pet do POST e um pet aleatório

    Cenário: [API] Buscar um Pet com sucesso via GET (Caminho Feliz)
        Dado o payload "meuBody" da collection com as variáveis "idRNG", "nameRNG" e "statusRNG" com tipagem e valores corretos
        Quando a requisição GET é disparada para o EndPoint com o "petIdGet" igual do "idRNG"
        Então o status code retornado deve ser 200
        E o body do response deve conter exatamente os mesmos valores da variável da collection "meuBody"
    
    Cenário: [API] Buscar um Pet com sucesso via Get, mas com dados diferentes (Caminho Triste)
        Dado o payload "meuBody" da collection com as variáveis "idRNG", "nameRNG" e "statusRNG" com tipagem e valores corretos
        Quando a requisição GET é disparada para o EndPoint com o "petIdGet" diferente do "idRNG"
        Então o status code retornado deve ser 200
        E o body do response deve conter valores diferentes da variável da collection "meuBody"

Funcionalidade: Validação do EndPoint da pesquisa do Pet inexistente (REQ-03)
    Como um analista de qualidade
    Quero enviar uma requisição GET com um id válido que não existe no banco
    Para garantir que API busque e retorne que não há nenhuma entrada com o id dado

    Contexto: Uma variável de Collection Criada
        Dado a variável de collection "petIdGet2" criada
        E os valores dessa variável pode ser de um id existente ou inexistente

    Cenário: [API] Buscar um pet inexistente via GET (Caminho Feliz)
        Dado a variável da collection com "petIdGet2" sendo um valor de id não existente no banco
        Quando a requisição GET é disparada para o EndPoint
        Então o status code retornado deve ser 404
        E o body response deve conter um "code" de erro com valor 1
    
    Cenário: [API] Buscar um pet com id inexistente via GET, mas o pet existe (Caminho Triste)
        Dado a variável da collection com "petIdGet2" sendo um valor de id de pet que existente no banco
        Quando a requisição GET é disparada para o EndPoint
        Então o status code retornado deve ser 200
        E o body response deve conter os valores de um pet aleatório do banco
