const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const pollRoutes = require('./polls');
const { registerSocketHandlers } = require('./pollSocket');

// ─── App & HTTP server ────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*', // Em produção, restrinja para o domínio do frontend
    methods: ['GET', 'POST'],
  },
});

// Disponibiliza a instância do io para os controllers via app.get('io')
app.set('io', io);

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Log de requisições (simples, sem dependência extra)
app.use((req, _res, next) => {
  console.log(`[http] ${req.method} ${req.url}`);
  next();
});

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api/polls', pollRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada.' });
});

// Error handler global
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
});

// ─── Sockets ──────────────────────────────────────────────────────────────────
registerSocketHandlers(io);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🗳️  Servidor de votação rodando em http://localhost:${PORT}`);
  console.log(`📡  Socket.io pronto na mesma porta\n`);
});
