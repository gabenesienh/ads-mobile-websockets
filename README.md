# Pollenta

## Um site para criação de polls (enquetes)

O Pollenta é um aplicativo web simples para criação de enquetes e votação em tempo real.

Cada enquente tem um endereço único, para facilidade de compartilhamento.

## Como rodar localmente

### Pré-requisitos

- Git
- Node.js
- Portas 3000, 8080 e 5173 abertas para TCP local

### Instruções

1. Clone o projeto
```bash
git clone https://github.com/gabenesienh/pollenta.git
cd pollenta
```

2. Instale as dependências (inclui as necessárias para desenvolvimento)
```bash
npm install
```

3. Inicie o servidor Express
```bash
npx run server
```

4. Inicie o servidor Websocket
```bash
npx run websocket
```

5. Inicie o client
```bash
npx run client
```

Para acessar o client, navegue para `http://localhost:5173`.