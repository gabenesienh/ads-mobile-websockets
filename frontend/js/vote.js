document.addEventListener("DOMContentLoaded", init);

let currentPoll = null;
let ws = null;
let countdownTimer = null;

async function init() {
  const pollId = new URLSearchParams(window.location.search).get("id");

  if (!pollId) {
    showError("Nenhuma votação especificada. Verifique o link.");
    return;
  }

  const shareInput = document.getElementById("share-link");
  shareInput.value = window.location.href;
  document.getElementById("btn-copy").addEventListener("click", () => {
    navigator.clipboard
      .writeText(shareInput.value)
      .then(() => showToast("Link copiado!", "success"))
      .catch(() => showToast("Não foi possível copiar.", "error"));
  });

  try {
    const poll = await getPoll(pollId);
    currentPoll = poll;
    renderPoll(poll);
    setupVoteForm(poll);
    startCountdown(poll);
    connectSocket(pollId);
  } catch (err) {
    showError(err.message || "Votação não encontrada.");
  }
}

function renderPoll(poll) {
  setState("poll");

  document.getElementById("poll-title").textContent = poll.title;

  const descEl = document.getElementById("poll-desc");
  descEl.textContent = poll.description || "";
  descEl.style.display = poll.description ? "block" : "none";

  const statusEl = document.getElementById("poll-status");
  if (poll.status === "active") {
    statusEl.textContent = "Ativa";
    statusEl.className = "badge badge-active";
  } else if (poll.status === "closed") {
    statusEl.textContent = "Encerrada";
    statusEl.className = "badge badge-closed";
  }

  document.getElementById("link-results").href = `results.html?id=${poll.id}`;

  renderOptions(poll);
  updateVoteUI(poll);
}

function renderOptions(poll) {
  const container = document.getElementById("options-container");
  container.innerHTML = "";

  const isMultiple = (poll.voteLimit || 1) > 1;
  const inputType = isMultiple ? "checkbox" : "radio";

  const instruction = document.getElementById("vote-instruction");
  instruction.textContent = isMultiple
    ? `Selecione até ${poll.voteLimit} opções e confirme seu voto.`
    : "Selecione uma opção e confirme seu voto.";

  poll.data.options.forEach((opt) => {
    const label = document.createElement("label");
    label.className = "vote-option";
    label.innerHTML = `
      <input type="${inputType}" name="vote_option" value="${opt.id}" />
      <span>${escapeHtml(opt.text)}</span>
    `;

    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      document
        .querySelectorAll(".vote-option")
        .forEach((el) => el.classList.remove("selected"));
      if (inputType === "radio") {
        if (input.checked) label.classList.add("selected");
      } else {
        document
          .querySelectorAll(".vote-option input:checked")
          .forEach((cb) => {
            cb.closest(".vote-option").classList.add("selected");
          });
      }
    });

    container.appendChild(label);
  });
}

function updateVoteUI(poll) {
  const alreadyVoted = hasVotedLocally(poll.id);
  const isClosed = poll.status !== "active";

  const votedNotice = document.getElementById("voted-notice");
  const closedNotice = document.getElementById("closed-notice");
  const btnVote = document.getElementById("btn-vote");
  const inputs = document.querySelectorAll("#options-container input");

  votedNotice.style.display = alreadyVoted ? "flex" : "none";
  closedNotice.style.display = isClosed ? "flex" : "none";

  const disabled = alreadyVoted || isClosed;
  btnVote.disabled = disabled;
  inputs.forEach((i) => (i.disabled = disabled));
}

function setupVoteForm(poll) {
  const form = document.getElementById("form-vote");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const checked = [
      ...document.querySelectorAll("#options-container input:checked"),
    ];
    if (checked.length === 0) {
      showToast("Selecione pelo menos uma opção.", "error");
      return;
    }

    const optionIds = checked.map((i) => i.value);
    const voterId = getVoterId();
    const btn = document.getElementById("btn-vote");

    btn.disabled = true;
    btn.textContent = "Enviando…";

    try {
      await castVote(poll.id, optionIds, voterId);
      markVotedLocally(poll.id, optionIds);
      showToast("Voto registrado!", "success");
      updateVoteUI({ ...poll, status: "active" });
    } catch (err) {
      showToast(err.message || "Erro ao votar.", "error");
      btn.disabled = false;
      btn.textContent = "Confirmar voto";
    }
  });
}

function connectSocket(pollId) {
  try {
    ws = createSocket();
    ws.joinPoll(pollId);

    ws.on("poll_closed", () => {
      if (currentPoll) currentPoll.status = "closed";
      updateVoteUI({ ...currentPoll, status: "closed" });
      showToast("Esta votação foi encerrada.", "default");
      document.getElementById("poll-status").textContent = "Encerrada";
      document.getElementById("poll-status").className = "badge badge-closed";
    });
  } catch (err) {
    console.warn("[Socket] Indisponível, modo offline.");
  }
}

function startCountdown(poll) {
  if (!poll.expiresAt) return;

  const el = document.getElementById("countdown");
  const expires = new Date(poll.expiresAt);

  function tick() {
    const diff = expires - Date.now();
    if (diff <= 0) {
      el.textContent = "Encerrada";
      clearInterval(countdownTimer);
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `Encerra em ${h}h ${m}m ${s}s`;
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

function setState(state) {
  document.getElementById("state-loading").style.display =
    state === "loading" ? "block" : "none";
  document.getElementById("state-error").style.display =
    state === "error" ? "block" : "none";
  document.getElementById("state-poll").style.display =
    state === "poll" ? "block" : "none";
}

function showError(msg) {
  setState("error");
  document.getElementById("error-msg").textContent = msg;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.addEventListener("beforeunload", () => {
  clearInterval(countdownTimer);
  ws?.destroy();
});
