import { createServer } from 'http';
import { Server } from 'socket.io';

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
});

ioServer.listen(WEBSOCKET_PORT, WEBSOCKET_HOST, () => {
  console.log(`Websocket ativo na porta ${WEBSOCKET_PORT}.`);
})