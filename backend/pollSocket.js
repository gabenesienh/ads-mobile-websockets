const { polls } = require('../store');
const { serializePoll } = require('../controllers/pollController');

/**
 * Registra todos os eventos Socket.io.
 * @param {import('socket.io').Server} io
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] cliente conectado: ${socket.id}`);

    // ── Entrar na sala de uma poll ────────────────────────────────────────
    // O cliente emite: socket.emit('poll:join', pollId)
    // Assim ele recebe atualizações somente daquela poll, se quiser
    socket.on('poll:join', (pollId) => {
      if (!polls.has(pollId)) {
        socket.emit('error', { message: 'Votação não encontrada.' });
        return;
      }
      socket.join(pollId);
      // Envia o estado atual imediatamente ao cliente que entrou
      socket.emit('poll:state', serializePoll(polls.get(pollId)));
      console.log(`[socket] ${socket.id} entrou na sala ${pollId}`);
    });

    // ── Sair da sala de uma poll ──────────────────────────────────────────
    socket.on('poll:leave', (pollId) => {
      socket.leave(pollId);
      console.log(`[socket] ${socket.id} saiu da sala ${pollId}`);
    });

    // ── Solicitar lista de polls ──────────────────────────────────────────
    // Útil para o frontend atualizar sem fazer uma requisição HTTP
    socket.on('polls:list', () => {
      const list = [...polls.values()].map(serializePoll);
      socket.emit('polls:list', list);
    });

    // ── Desconexão ────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[socket] cliente desconectado: ${socket.id} — ${reason}`);
    });
  });
}

module.exports = { registerSocketHandlers };
