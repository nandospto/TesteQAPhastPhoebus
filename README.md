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
        pm.collectionVariables.set("InteraDel", 0);
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

Aqui, como a única request depois do POST que não precisa do petId é a REQ-03, adicionamos o `pm.execution.setNextRequest("REQ-03");` para pular a próxima requisição (GET) quando executamos collection run. O `pm.collectionVariables.set("InteraDel", 0);` é usado na REQ-04 para a interação multipla para teste do DELETE.

### Comportamentos do POST

O erro mais simples aqui de se analisar é o status code 500, onde a API não consegue processar o `typeof id` como string, esse é esperado.

Porém um erro que não foi considerado na API e verificado no teste, é do fato da API não haver uma validação para o caso de que o status aceite uma string que não está no seu projeto. Na documentação o status do pet é um enum com `[available, pending, sold]`, porém no corpo ele aceita `status: 1`, por exemplo, convertendo de `number` para `string` sem validação na API (no swager ele não aceita). O mesmo ocorre para o `name`com a conversão de um `number` para `string` na response.

### Análise do GET com o pet do POST (REQ-02)

Pelo guia do desafio, teriamos que pegar o id enviado na REQ-01 onde a resposta tem um body com os dados de: id, nome e status do pet. Nessa requisição, o caminho feliz são os dados corretos e iguais com aqueles enviados pelo POST. No caminho triste, obtemos o GET corretamente, porém simulamos uma id diferente para obter outros dados que vão ser diferentes daqueles que forem enviados pela REQ-01.

O script inicial, antes da requisição, fica:

```javascript
const idarraytest = [2, pm.collectionVariables.get("petId")];

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

### Análise do GET com o pet inexistente (REQ-03)

Pelo guia, a REQ-03 é uma requisição simples de validação de um get em um PET inexistente. Diferente da REQ-02, o caminho feliz dessa requisação necessita de que o pet não exista no banco da API.

O script de Pre-Request é dado por:

```javascript
const arrayid = [2, 404];

const indexRNG = Math.floor(Math.random() * arrayid.length);
pm.collectionVariables.set("petIdGet2", arrayid[indexRNG]);
```

Ele varia entre um valor que sabemos que existe no banco e outro que não existe. O valor é salvo em uma variável da collection "petIdGet2" onde é usada no endpoint.

O script de Post-Response é:

```javascript
const response = pm.response.json();

if (!response.id) {
    pm.test("Get em pet inexistente", function () {
        pm.response.to.have.status(404);
    });
} else {
    pm.test("Get em pet existente", function(){
        pm.response.to.have.status(200);
    });
}

const petId = pm.collectionVariables.get("petId");

if (typeof petId != 'number') {
    pm.execution.setNextRequest(null);
}
```

Aqui temos a mesma variação para o caso do REQ-01, onde se o POST do REQ-01 enviar um valor não aceito, a próxima requisição, REQ-04 (delete), não é disparada.

### Comportamentos do GET de pet Inexistente

Aqui o comportamento é mais simples, se o get retornar um pet (caminho triste) o status code é 200, caso não haja pet, o status code é 404. A validação é dada pela `response.id` onde sempre existe para pets que estão no banco da API.

### Análise do DELETE (REQ-04)

O DELETE é outro processo simples. Temos o caminho feliz, onde a requisição passa normalmente e deleta o pet do banco e o caminho triste é quando a requisição tenta apagar um pet que não existe.

Para o pre-req:

```javascript
const myBody = JSON.parse(pm.collectionVariables.get("meuBody"));

pm.collectionVariables.set("petIdDelete", myBody.id);
```

Aqui trazemos apenas o payload criado no POST para pegar o id correto do pet.

```javascript
if (pm.collectionVariables.get("InteraDel") == 0) {
    pm.test("Status code 200 - Pet deletado", function () {
        pm.collectionVariables.set("InteraDel", 1);
        pm.response.to.have.status(200);
        pm.execution.setNextRequest("REQ-04");
    });
} else {
    pm.test("Status code is 404", function () {
        pm.response.to.have.status(404);
        pm.collectionVariables.set("InteraDel", 0);
    });
}
```

Aplicamos então uma interação, onde apagamos o pet criado no POST e logo após interagimos novamente de forma a verificar a situação do delete de um pet removido.

### Comportamento do DELETE

O DELETE se comportou no esperado, seguindo o caminho feliz para o teste normal e o triste para quando não há pet para o id enviado.

## Relatórios do Collection Runner

A collection e enviroment do postman estão disponíveis na pasta postman:

* [Coleção de Testes (Collection)](./postman/collections.json)
* [Variáveis de Ambiente (Environment)](./postman/environment.json)

Usando o trial do postman, conseguimos criar um relatório do Collection Runner do postman.
Realizei 3 runs que demostram os seguintes cenário, gerando também imagens:

* [Cenário perfeito, onde tudo ocorre corretamente](./postman/Run1.json). [Imagem](./src/postman_01%20(correto).png)
* [Cenário do bug da API aceitando id como 'string'](./postman/Run2.json). [Imagem](./src/postman_02%20(id%20string%20bug).png)
* [Cenário do bug da API aceitando e não validando os valores das 'strings' do name ou status](./post/Run3.json). [Imagem](./src/postman_03%20(number%20to%20string%20bug).png)

### Cypress e Teste do Frontend

Para usar o cypress, é necessário instalá0lo em uma pasta separada para o projeto. Instalei o node e cypress na pasta frontend usando `npm init` e `npm install cypress --save-dev`.

Agora vamos instalar o mochawsome com `npm install mocha mochawesome mochawesome-merge mochawesome-report-generator --save-dev` que irá gerar os relatórios.

Abrindo o cypress com `npx cypress open` e fazendo a configuração de e2e com o EDGE, podemos fazer um novo spec de teste para o teste da phoebus.

O arquivo gerado é o [phoebustest.cy.js](./frontend/cypress/e2e/phoebustest.cy.js).

Antes, devemos saber como funciona o site da phoebus para adicionar para o teste. O elemento `<a>` de história tem um `data-testid="linkElement"`, vamos utilizá-lo no cypress, da mesma forma que os botões tem `data-testid="buttonContent"` e o slider do texto `[data-testid="slidesWrapper"][aria-live="polite"]`. Esse último é importante, pois enquanto podemos filtrar a componente `<a>` com o texto "História" e os botões com os anos, o conteudo dos sliders variam, mas os outros tem a tag `alira-live="off"`.

Aqui o script de automação do teste:

```javascript
describe('Teste da phoebus para o FrontEnd', () => {
  it('Navegar pelo site até a parte de história e anos', () => {
    cy.viewport(1920, 1080);
    cy.visit('https://phoebus.com.br');
    
    cy.wait(3000);
    cy.get('[data-testid="linkElement"]').contains('HISTÓRIA').click();
    
    const testedosanos = [2000, 2010, 2020];

    cy.wait(3000);
    testedosanos.forEach((ano) => {
      cy.get('[data-testid="buttonContent"]').contains(ano).click({ scrollBehavior: false, force: true });
      cy.wait(1000);
      cy.get('[data-testid="slidesWrapper"][aria-live="polite"]').should('contain', ano);
      cy.screenshot(`historia-ano-${ano}`, {capture: 'viewport'});
    });
  })
})
```

Fixei a viewport para manter o site consistente com um tamanho, acessamos o site com o `cy.visit('https://phoebus.com.br')` e aguardamos 3 segundos para deixar o site carregar antes de clicar. A componente é filtrada tanto pela tag (boas práticas na documentação do cypress) quanto pelo conteúdo contendo "HISTÓRIA". Atribuimos um array de teste para os anos que quisermos, aguardamos 3 segundos até a rolagem chegar na componente do texto de história.

Adicionei o `{ scrollBehavior: false, force: true }`, pois o click simples estava fazendo a tela rolar para baixo. Aguardamos 1 segundo e então temos a validação do slider que deve conter o ano testado. Logo em seguida salvamos uma captura de tela fixando o viewport completo.

Para gerar o relatório usando o mochawesome, utilizei `npm install --save-dev cypress-mochawesome-reporter` que adiciona automaticamente as capturas de tela. Então só precisamos adicionar o mocha às configs do cypress e executar o npx cypress run.

Obtemos o relatório no [arquivo](./frontend/cypress/reports/index.html).

E as capturas de tela do mocha estão na pasta [screenshots](./frontend/cypress/screenshots/phoebustest.cy.js/).
