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

  if (pollEncontrada === undefined) {
    return res
      .status(404)
      .json({ error: 'A poll não existe.' });
  }

  return res
    .status(200)
    .json(pollEncontrada);
});

// Criar nova poll
server.post('/api/polls', (req, res) => {
  const { titulo, opcoes } = req.body;

  // Verificar se os campos foram informados
  if (titulo === undefined) {
    return res
      .status(400)
      .json({ error: 'A poll não possui um título.' });
  }

  if (opcoes === undefined) {
    return res
      .status(400)
      .json({ error: 'A poll precisa de pelo menos duas opções.' });
  }

  // Remover opções vazias
  let opcoesLimpo = opcoes.filter((opcao) => opcao.trim() !== '');

  // Validar número de opções
  if (opcoesLimpo.length < 2) {
    return res
      .status(400)
      .json({ error: 'A poll precisa de pelo menos duas opções.' });
  }

  if (opcoesLimpo.length > 6) {
    return res
      .status(400)
      .json({ error: 'A poll pode ter ao máximo seis opções.' });
  }

  // Criar poll com um ID único
  const newPollId = uuidv4();

  polls[newPollId] = {
    'titulo': titulo,
    'opcoes': opcoesLimpo.map((opcao) => ({
      'desc': opcao,
      'votos': 0,
    })),
  };

  return res
    .status(201)
    .json({ pollId: newPollId });
});

// Registrar voto
server.post('/api/votar', (req, res) => {
  const { pollId, opcaoId } = req.body;

  // Verificar se os campos foram informados
  if (pollId === undefined) {
    return res
      .status(400)
      .json({ error: 'O voto precisa incluir o ID da poll.' });
  }

  if (opcaoId === undefined) {
    return res
      .status(400)
      .json({ error: 'O voto precisa incluir o ID da opção.' });
  }

  // Validar campos
  if (polls[pollId] === undefined) {
    return res
      .status(404)
      .json({ error: 'Nenhuma poll existe com este ID.' });
  }

  if (polls[pollId].opcoes[opcaoId] === undefined) {
    return res
      .status(404)
      .json({ error: 'Esta opção não existe para a poll informada.' });
  }

  // Atualizar a contagem de votos
  polls[pollId].opcoes[opcaoId].votos++

  return res
    .status(200)
    .json({
      opcaoId: opcaoId,
      qtdVotos: polls[pollId].opcoes[opcaoId].votos,
    });
});

// Iniciar servidor
server.listen(SERVER_PORT, () => {
  console.log(`Servidor ativo na porta ${SERVER_PORT}.`);
});