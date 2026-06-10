const { v4: uuidv4 } = require('uuid');
const { polls } = require('./store');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Serializa uma poll removendo o Set de voters (não expõe quem votou).
 * Retorna contagem total e percentuais por opção.
 */
function serializePoll(poll) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    type: poll.type,
    status: poll.status,
    createdAt: poll.createdAt,
    closedAt: poll.closedAt,
    totalVotes,
    options: poll.options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: o.votes,
      percentage: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0,
    })),
  };
}

/** Gera um token único de votante a partir do IP + user-agent */
function voterToken(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || '';
  return `${ip}::${ua}`;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** GET /api/polls — lista todas as polls */
function listPolls(req, res) {
  const list = [...polls.values()].map(serializePoll);
  res.json({ success: true, data: list });
}

/** GET /api/polls/:id — busca uma poll pelo id */
function getPoll(req, res) {
  const poll = polls.get(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Votação não encontrada.' });
  res.json({ success: true, data: serializePoll(poll) });
}

/** POST /api/polls — cria uma nova poll */
function createPoll(req, res) {
  const { title, description = '', type = 'single', options } = req.body;

  // Validações
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'O campo "title" é obrigatório.' });
  }
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ success: false, message: 'São necessárias pelo menos 2 opções.' });
  }
  if (!['single', 'multiple', 'rating'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Tipo inválido. Use: single, multiple ou rating.' });
  }

  const poll = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    type,
    options: options.map((text, i) => ({
      id: `opt_${i + 1}`,
      text: String(text).trim(),
      votes: 0,
    })),
    voters: new Set(),
    status: 'open',
    createdAt: new Date().toISOString(),
    closedAt: null,
  };

  polls.set(poll.id, poll);

  // Notifica todos via Socket.io (io injetado no res.locals pelo middleware)
  req.app.get('io').emit('poll:created', serializePoll(poll));

  res.status(201).json({ success: true, data: serializePoll(poll) });
}

/** DELETE /api/polls/:id — remove uma poll */
function deletePoll(req, res) {
  const poll = polls.get(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Votação não encontrada.' });

  polls.delete(req.params.id);
  req.app.get('io').emit('poll:deleted', { id: req.params.id });

  res.json({ success: true, message: 'Votação removida.' });
}

/** PATCH /api/polls/:id/close — encerra a votação */
function closePoll(req, res) {
  const poll = polls.get(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Votação não encontrada.' });
  if (poll.status === 'closed') {
    return res.status(400).json({ success: false, message: 'Votação já está encerrada.' });
  }

  poll.status = 'closed';
  poll.closedAt = new Date().toISOString();

  req.app.get('io').emit('poll:closed', serializePoll(poll));

  res.json({ success: true, data: serializePoll(poll) });
}

/** PATCH /api/polls/:id/reopen — reabre a votação */
function reopenPoll(req, res) {
  const poll = polls.get(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Votação não encontrada.' });
  if (poll.status === 'open') {
    return res.status(400).json({ success: false, message: 'Votação já está aberta.' });
  }

  poll.status = 'open';
  poll.closedAt = null;

  req.app.get('io').emit('poll:reopened', serializePoll(poll));

  res.json({ success: true, data: serializePoll(poll) });
}

// ─── Voto ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/polls/:id/vote
 * Body: { optionIds: string[] }  (array para suportar tipo "multiple")
 */
function vote(req, res) {
  const poll = polls.get(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Votação não encontrada.' });
  if (poll.status === 'closed') {
    return res.status(400).json({ success: false, message: 'Esta votação está encerrada.' });
  }

  const token = voterToken(req);
  if (poll.voters.has(token)) {
    return res.status(409).json({ success: false, message: 'Você já votou nesta votação.' });
  }

  const { optionIds } = req.body;
  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Envie ao menos uma opção em "optionIds".' });
  }

  // Para tipo "single", aceita apenas 1 opção
  if (poll.type === 'single' && optionIds.length > 1) {
    return res.status(400).json({ success: false, message: 'Esta votação aceita apenas uma opção.' });
  }

  // Valida que todas as opções existem
  const validIds = new Set(poll.options.map((o) => o.id));
  for (const id of optionIds) {
    if (!validIds.has(id)) {
      return res.status(400).json({ success: false, message: `Opção inválida: ${id}` });
    }
  }

  // Computa os votos
  for (const id of optionIds) {
    const option = poll.options.find((o) => o.id === id);
    option.votes += 1;
  }
  poll.voters.add(token);

  const serialized = serializePoll(poll);

  // Emite atualização em tempo real
  req.app.get('io').emit('poll:updated', serialized);

  res.json({ success: true, data: serialized });
}

module.exports = {
  listPolls,
  getPoll,
  createPoll,
  deletePoll,
  closePoll,
  reopenPoll,
  vote,
  serializePoll, // exportado para uso no socket handler
};
