# Teste da Phoebus para a vaga de QA (assistente de qualidade)

## Estratégia

### Análise do POST (REQ-01)

Pelo guia do desafio, teria que enviar um body com os dados de: id, nome e status do pet. Assim. entendi que a forma mais fácil de testar o post é simplesmente enviando os dados corretos (caminho feliz) e os dados incorretos (caminho triste).

Assim, pensei na ideia de fazer um body aleatório em que possa alternar entre valores corretos (maior parte das vezes) e incorretos. 

O body seria como:

```json
{
    "id" : 'number',
    "name" : 'string',
    "status" : 'string'
}
```

O caminho feliz é validado com a variável `caminhofeliz = true` onde todos os parâmetros são do tipo corretos.
Se o status code está dando 200 então temos apenas que validar se os valores e tipos enviados batem com os valores e tipos da resposta.

### Comportamentos do POST

O erro mais simples aqui de se analisar é o status code 500, onde a API não consegue processar o `typeof id` como string, esse é esperado.

Porém um erro que não foi considerado na API e verificado no teste, é do fato da API não haver uma validação para o caso de que o status aceite uma string que não está no seu projeto. Na documentação o status do pet é um enum com `[available, pending, sold]`, porém no corpo ele aceita `status: 1`, por exemplo, convertendo de `number` para `string` sem validação na API (no swager ele não aceita).

### Análise do GET com o pet do POST (REQ-02)

## Ferramentas: Por que escolheu o framework X ou Y para o Front?

## Demonstração Viva: Mostre o Postman rodando e o teste de Front abrindo o navegador

## Evidências: Mostre os relatórios gerados e os prints das capturas de tela

## Código: Explique como você fez para o teste de front identificar se o ano no texto estava correto
