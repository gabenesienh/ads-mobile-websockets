const { Router } = require('express');
const {
  listPolls,
  getPoll,
  createPoll,
  deletePoll,
  closePoll,
  reopenPoll,
  vote,
} = require('./pollController');

const router = Router();

// ── Polls ──────────────────────────────────────────────────────────────────
router.get('/',          listPolls);   // Listar todas
router.get('/:id',       getPoll);     // Buscar uma
router.post('/',         createPoll);  // Criar
router.delete('/:id',    deletePoll);  // Remover

// ── Status ────────────────────────────────────────────────────────────────
router.patch('/:id/close',   closePoll);   // Encerrar
router.patch('/:id/reopen',  reopenPoll);  // Reabrir

// ── Voto ──────────────────────────────────────────────────────────────────
router.post('/:id/vote', vote);

module.exports = router;
