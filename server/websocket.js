import { createServer } from 'http';
import { Server } from 'socket.io';

const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_HOST}:${SERVER_PORT}`;
const WEBSOCKET_HOST = '0.0.0.0';
const WEBSOCKET_PORT = 8080;
const WEBSOCKET_URL = `${WEBSOCKET_HOST}:${WEBSOCKET_PORT}`;

const ioServer = createServer((req, res) => {
  res.writeHead(403);
  res.end();
})

const io = new Server(ioServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket) => {
  console.log('Um usuário conectou ao websocket');

  socket.on('disconnect', () => {
    console.log('Um usuário se desconectou do websocket');
  });

  socket.on('votoEnviado', async ({ pollId, opcaoId }) => {
    let res = await fetch(`http://${SERVER_URL}/api/votar`, {
      method: 'POST',
      body: JSON.stringify({ pollId, opcaoId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (res.status == 200) {
      io.emit('votoSucesso', {
        opcaoId: data.opcaoId,
        qtdVotos: data.qtdVotos
      });
      console.log(`Voto cadastrado para a opção ${opcaoId} da poll ${pollId}`);
    }
  })
});

ioServer.listen(WEBSOCKET_PORT, WEBSOCKET_HOST, () => {
  console.log(`Websocket ativo na porta ${WEBSOCKET_PORT}.`);
})