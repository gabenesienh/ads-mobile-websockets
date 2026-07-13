import express from 'express';
import cors from 'cors';

const SERVER_PORT = 3000;

const server = express();

server.use(cors());

// Criar nova poll
server.post('/api/polls', (req, res) => {
  res.status(200).json({});
});

// Iniciar servidor
server.listen(SERVER_PORT, () => {
  console.log(`Servidor ativo na porta ${SERVER_PORT}.`);
});