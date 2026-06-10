# 🗳️ Backend — Votação PWA

Stack: **Node.js · Express · Socket.io · In-memory store**

---

## Instalação e execução

```bash
cd backend
npm install

# Produção
npm start

# Desenvolvimento (com hot-reload)
npm run dev
```

O servidor sobe em `http://localhost:3000` por padrão.  
Defina a variável `PORT` para mudar a porta.

---

## REST API

### Base URL
```
http://localhost:3000/api/polls
```

---

### Tipos de votação (`type`)

| Valor      | Descrição                              |
|------------|----------------------------------------|
| `single`   | Escolha de **uma** opção               |
| `multiple` | Escolha de **várias** opções           |
| `rating`   | Avaliação (opções = notas, ex: 1 a 5)  |

---

### Endpoints

#### `GET /api/polls`
Lista todas as votações.

**Resposta:**
```json
{
  "success": true,
  "data": [ ...polls ]
}
```

---

#### `GET /api/polls/:id`
Retorna uma votação específica.

---

#### `POST /api/polls`
Cria uma nova votação.

**Body:**
```json
{
  "title": "Qual framework você prefere?",
  "description": "Escolha o seu favorito",
  "type": "single",
  "options": ["React", "Vue", "Angular", "Svelte"]
}
```

---

#### `DELETE /api/polls/:id`
Remove uma votação.

---

#### `PATCH /api/polls/:id/close`
Encerra a votação (ninguém mais pode votar).

---

#### `PATCH /api/polls/:id/reopen`
Reabre uma votação encerrada.

---

#### `POST /api/polls/:id/vote`
Registra um voto.

**Body:**
```json
{ "optionIds": ["opt_1"] }
```
> Para tipo `multiple`, envie múltiplos ids: `["opt_1", "opt_3"]`

**Regras:**
- Cada IP/user-agent só pode votar uma vez por poll.
- Tipo `single` aceita apenas 1 opção.
- Polls encerradas não aceitam votos.

---

### Formato de uma poll na resposta

```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "type": "single",
  "status": "open",
  "createdAt": "ISO date",
  "closedAt": null,
  "totalVotes": 42,
  "options": [
    { "id": "opt_1", "text": "React", "votes": 20, "percentage": 48 }
  ]
}
```

---

## Socket.io

Conecte-se em `ws://localhost:3000`.

### Eventos que o **cliente emite**

| Evento       | Payload    | Descrição                              |
|--------------|------------|----------------------------------------|
| `poll:join`  | `pollId`   | Entra na sala da poll (recebe updates) |
| `poll:leave` | `pollId`   | Sai da sala                            |
| `polls:list` | —          | Solicita lista atual de polls          |

### Eventos que o **servidor emite**

| Evento         | Payload         | Quando                          |
|----------------|-----------------|---------------------------------|
| `poll:created` | poll serializada | Nova poll criada                |
| `poll:updated` | poll serializada | Voto registrado                 |
| `poll:closed`  | poll serializada | Poll encerrada                  |
| `poll:reopened`| poll serializada | Poll reaberta                   |
| `poll:deleted` | `{ id }`        | Poll removida                   |
| `poll:state`   | poll serializada | Enviado ao entrar numa sala     |
| `polls:list`   | poll[]          | Resposta ao evento `polls:list` |
| `error`        | `{ message }`   | Erro no socket                  |

---

## Estrutura de arquivos

```
backend/
├── controllers/
│   └── pollController.js   # Lógica de negócio
├── routes/
│   └── polls.js            # Rotas REST
├── sockets/
│   └── pollSocket.js       # Handlers Socket.io
├── store.js                # Estado in-memory
├── server.js               # Entry point
└── package.json
```
