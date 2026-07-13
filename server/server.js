import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const SERVER_PORT = 3000;

const server = express();

server.use(cors());
server.use(express.json());

// Polls criadas
let polls = {};

/* -- Rotas -- */

// Retornar polls existentes
server.get('/api/polls', (req, res) => {
  return res
    .status(200)
    .json(polls);
});

// Retornar uma poll específica
server.get('/api/polls/:id', (req, res) => {
  const pollEncontrada = polls[req.params.id];

  if (!pollEncontrada) {
    return res
      .status(404)
      .json({ error: 'Esta poll não existe.' });
  }

  return res
    .status(200)
    .json(pollEncontrada);
});

// Criar nova poll
server.post('/api/polls', (req, res) => {
  const { titulo, opcao1, opcao2 } = req.body;

  if (!titulo) {
    return res
      .status(400)
      .json({ error: 'A poll não possui um título.' });
  }

  if (!opcao1 || !opcao2) {
    return res
      .status(400)
      .json({ error: 'A poll precisa de pelo menos duas opções.' });
  }

  // Criar poll com um ID único
  const newPollId = uuidv4();

  polls[newPollId] = {
    'titulo': titulo,
    'opcao1': opcao1,
    'opcao2': opcao2
  };

  return res
    .status(201)
    .json({ pollId: newPollId });
});

// Iniciar servidor
server.listen(SERVER_PORT, () => {
  console.log(`Servidor ativo na porta ${SERVER_PORT}.`);
});