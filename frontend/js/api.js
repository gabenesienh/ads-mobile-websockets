const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";

/**
 * W
 * @param {string} path
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    const msg = body?.message || body?.error || `Erro ${res.status}`;
    throw new Error(msg);
  }

  return body;
}

async function getPolls() {
  return apiFetch("/polls");
}

async function getPoll(id) {
  return apiFetch(`/polls/${id}`);
}

/**
 * Cria nova votação
 * @param {{ title, description, options, voteLimit, expiresAt }} payload
 */
async function createPoll(payload) {
  return apiFetch("/polls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function closePoll(id) {
  return apiFetch(`/polls/${id}/close`, { method: "PATCH" });
}

async function deletePoll(id) {
  return apiFetch(`/polls/${id}`, { method: "DELETE" });
}

/**
 * Registra um voto
 * @param {string} pollId
 * @param {string|string[]} optionIds   ID(s) da(s) opção(ões)
 * @param {string} [voterId]            Identificador anônimo do votante
 */
async function castVote(pollId, optionIds, voterId) {
  return apiFetch(`/polls/${pollId}/vote`, {
    method: "POST",
    body: JSON.stringify({
      options: Array.isArray(optionIds) ? optionIds : [optionIds],
      voterId,
    }),
  });
}

async function getResults(pollId) {
  return apiFetch(`/polls/${pollId}/results`);
}

function getVoterId() {
  let id = localStorage.getItem("voterId");
  if (!id) {
    id =
      "v_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
    localStorage.setItem("voterId", id);
  }
  return id;
}

function hasVotedLocally(pollId) {
  const votes = JSON.parse(localStorage.getItem("votes") || "{}");
  return !!votes[pollId];
}

function markVotedLocally(pollId, optionIds) {
  const votes = JSON.parse(localStorage.getItem("votes") || "{}");
  votes[pollId] = { optionIds, at: Date.now() };
  localStorage.setItem("votes", JSON.stringify(votes));
}
