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

O script de Pre-Request ficou como:

```javascript
// Variação de valores
const idbase = [Math.floor(Math.random() * 10000), Math.floor(Math.random() * 10000), "string"];
const namebase = ["Pet" + Math.floor(Math.random() * 10000),"Pet" + Math.floor(Math.random() * 10000), 1501];
const statusbase = ["available", "pending", "sold", "error", 1];

// Escolha dos valores nas arrays acima
const indiceIdRNG = Math.floor(Math.random() * idbase.length);
const indiceNameRNG = Math.floor(Math.random() * namebase.length);
const indiceStatusRNG = Math.floor(Math.random() * statusbase.length);

// Body que será enviado para a API
const meuBody ={
    "id": idbase[indiceIdRNG],
    "name": namebase[indiceNameRNG],
    "status": statusbase[indiceStatusRNG]
}

// Criação de uma variável de collection para o body do POST e para o Id do GET
pm.collectionVariables.set("meuBody", JSON.stringify(meuBody));
pm.collectionVariables.set("petId", idbase[indiceIdRNG]);
```

O caminho feliz é validado com a variável `caminhofeliz = true` onde todos os parâmetros são do tipo corretos.
Se o status code está dando 200 então temos apenas que validar se os valores e tipos enviados batem com os valores e tipos da resposta.

Aqui o script do Post-Response:

```javascript
// Carregamento do body da collection
const meuBody = JSON.parse(pm.collectionVariables.get("meuBody"));

// Carregamento das variáveis
const idRNG = meuBody.id;
const nameRNG = meuBody.name;
const statusRNG = meuBody.status ;

// Definição do caminho feliz
const caminhoFeliz =
    (typeof idRNG == 'number') &&
    (typeof nameRNG == 'string') &&
    (typeof statusRNG == 'string');

if (caminhoFeliz) {
    pm.test("Post status 200 - Body Corretos", function () {
        pm.response.to.have.status(200);
    });
} else if (typeof idRNG === 'string') {
    pm.test("Post status 500 - Id como string", function () {
        pm.response.to.have.status(500);
        pm.execution.setNextRequest("REQ-03");
    });
}
else {
    pm.test("Post status 400 - Body Errado", function () {
        pm.response.to.have.status(400);
    });
}

if (pm.response.code === 200) {
    var resposta = pm.response.json();

    pm.test("Body do Post com id e tipo do id corretos", function () {
        pm.expect(resposta.id).to.be.a('number');
        pm.expect(resposta.id).to.eql(idRNG);
    });

    pm.test("Body do Post com name e tipo name corretos", function () {
        pm.expect(resposta.name).to.be.a('string');
        pm.expect(resposta.name).to.eql(nameRNG);
    });

    if (["available", "pending", "sold"].includes(statusRNG)) {
        pm.test("Body do Post com status e tipo do status corretos", function () {
            pm.expect(resposta.status).to.be.a('string');
            pm.expect(resposta.status).to.eql(statusRNG);
        });
    }
    else {
        pm.test("Body com tipo do status correto, mas string não válida", function (){
            pm.expect(resposta.status).to.be.a('string');
        });
    }
}
```

Aqui, como a única request depois do POST que não precisa do petId é a REQ-03, adicionamos o `pm.execution.setNextRequest("REQ-03");` para pular a próxima requisição (GET) quando executamos collection run.

### Comportamentos do POST

O erro mais simples aqui de se analisar é o status code 500, onde a API não consegue processar o `typeof id` como string, esse é esperado.

Porém um erro que não foi considerado na API e verificado no teste, é do fato da API não haver uma validação para o caso de que o status aceite uma string que não está no seu projeto. Na documentação o status do pet é um enum com `[available, pending, sold]`, porém no corpo ele aceita `status: 1`, por exemplo, convertendo de `number` para `string` sem validação na API (no swager ele não aceita). O mesmo ocorre para o `name`com a conversão de um `number` para `string` na response.

### Análise do GET com o pet do POST (REQ-02)

Pelo guia do desafio, teriamos que pegar o id enviado na REQ-01 onde a resposta tem um body com os dados de: id, nome e status do pet. Nessa requisição, o caminho feliz são os dados corretos e iguais com aqueles enviados pelo POST. No caminho triste, obtemos o GET corretamente, porém simulamos uma id diferente para obter outros dados que vão ser diferentes daqueles que forem enviados pela REQ-01.

O script inicial, antes da requisição, fica:

```javascript
const idarraytest = [1, pm.collectionVariables.get("petId")];

const idRNG = Math.floor(Math.random() * idarraytest.length);
const petIdGet = idarraytest[idRNG];

pm.collectionVariables.set("petIdGet", petIdGet);
```

Alternamos o GET para pegar ou o pet criado no POST ou um pet aleatório que existe. O tratamento de um pet inexistente é feito na REQ-03.

Depois de disparar o GET, devemos pegar uma resposta com os dados ou iguais ou diferentes daqueles criados no POST da REQ-01

Aqui o script do Post-Req:

```javascript
const meuBody = JSON.parse(pm.collectionVariables.get("meuBody"));

const idRNG = meuBody.id;
const nameRNG = meuBody.name;
const statusRNG = meuBody.status;

const resposta = pm.response.json();

console.log(resposta);

const caminhofeliz = (resposta &&
    resposta.id === idRNG &&
    resposta.name === nameRNG &&
    resposta.status === statusRNG);

if (caminhofeliz) {
    pm.test("Get status 200 - Dados iguais com o Post", function () {
        pm.response.to.have.status(200);
    });

    if (pm.response.code === 200) {
        pm.test("Resposta do Get com id e tipo do id corretos", function () {
            pm.expect(resposta.id).to.be.a('number');
            pm.expect(resposta.id).to.eql(idRNG);
        });
        pm.test("Resposta do Get com name e tipo do name corretos", function () {
            pm.expect(resposta.name).to.be.a('string');
            pm.expect(resposta.name).to.eql(nameRNG);
        });
        pm.test("Resposta do Get com status e tipo do status corretos", function () {
            pm.expect(resposta.status).to.be.a('string');
            pm.expect(resposta.status).to.eql(statusRNG);
        });
    }
} else {
    pm.test("Get status 200 com Dados diferentes do post", function () {
        pm.response.to.have.status(200);
    });
}
```

### Comportamentos do GET

O GET seguiu na conformidade do plano de teste, com dados iguais ao post, retorna o status code 200 e valida o tipo e os valores (novamente) dos valores da resposta. Com os dados diferentes, também há status code 200, porém não há validação dos dados, pois eles são diferentes dos dados criados no POST.

## Ferramentas: Por que escolheu o framework X ou Y para o Front?

## Demonstração Viva: Mostre o Postman rodando e o teste de Front abrindo o navegador

## Evidências: Mostre os relatórios gerados e os prints das capturas de tela

## Código: Explique como você fez para o teste de front identificar se o ano no texto estava correto
