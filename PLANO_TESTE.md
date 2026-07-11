# Plano de testes

```gherkin
Funcionalidade: Validação do EndPoint do cadatro de Pet (REQ-01)
    Como um analista de qualidade
    Quero enviar uma requisição POST com os parâmetros id, name e status
    Para garantir que API processe, armazene e retorne os dados corretamente

    Contexto: Variáveis da Collection criadas
        Dado que as variáveis "petId", "petName" e "petStatus", com valores aleatórios, foram criadas na collection de teste

    Cenário: [API] Criar um Pet com sucesso via POST (Caminho Feliz)
        Quando envio uma requisição POST para o endpoint com as variáveis da collection escolhidas
        Então o status code retornado deve ser 200
        E o body do response deve conter exatamente os mesmos valores enviados

    Cenário: [API] Validar erro ao enviar payload com o "petId" com um tipo diferente de 'number' (Caminho Triste)
        Dado que as variáveis "petId" estejam com um tipo de dado diferente de 'number'
        Quando envio a requisição POST para o endpoint
        Então o status code retornado devve ser 400

    Cenário: [API] Validar erro ao enviar payload com o "petName" com um tipo diferente de 'string' (Caminho Triste)
        Dado que as variáveis "petName" estejam com um tipo de dado diferente de 'string'
        Quando envio a requisição POST para o endpoint
        Então o status code retornado devve ser 400

    Cenário: [API] Validar erro ao enviar payload com o "petStatus" com um tipo diferente de 'string' (Caminho Triste)
        Dado que as variáveis "petStatus" estejam com um tipo de dado diferente de 'string'
        Quando envio a requisição POST para o endpoint
        Então o status code retornado devve ser 400
