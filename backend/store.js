// store.js — estado global em memória
// Estrutura de uma enquete (poll):
// {
//   id: string,
//   title: string,
//   description: string,
//   type: 'single' | 'multiple' | 'rating',
//   options: [{ id, text, votes }],
//   voters: Set<string>,       // IPs/tokens que já votaram
//   status: 'open' | 'closed',
//   createdAt: Date,
//   closedAt: Date | null,
// }

const polls = new Map();

module.exports = { polls };
