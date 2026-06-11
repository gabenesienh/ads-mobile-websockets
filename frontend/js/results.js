document.addEventListener("DOMContentLoaded", init);

let ws = null;
let currentPollId = null;

async function init() {
  await populatePollSelector();

  const urlId = new URLSearchParams(window.location.search).get("id");

  document.getElementById("btn-load").addEventListener("click", () => {
    const id = document.getElementById("poll-select").value;
    if (!id) {
      showToast("Selecione uma votação.", "error");
      return;
    }
    loadResults(id);
  });

  if (urlId) {
    document.getElementById("poll-select").value = urlId;
    loadResults(urlId);
  }

  document.getElementById("btn-export").addEventListener("click", exportCsv);
  document
    .getElementById("btn-close-poll")
    .addEventListener("click", closePollHandler);
}

async function populatePollSelector() {
  const select = document.getElementById("poll-select");
  try {
    const polls = await getPolls();
    if (!polls || polls.length === 0) return;
    polls.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.title;
      select.appendChild(opt);
    });
  } catch {}
}

async function loadResults(pollId) {
  currentPollId = pollId;
  setState("loading");

  ws?.destroy();

  try {
    const data = await getResults(pollId);
    renderResults(data);
    connectSocket(pollId);
  } catch (err) {
    showToast(err.message || "Erro ao carregar resultados.", "error");
    setState("empty");
  }
}

function renderResults(data) {
  setState("results");

  document.getElementById("result-title").textContent = data.title;
  const descEl = document.getElementById("result-desc");
  descEl.textContent = data.description || "";
  descEl.style.display = data.description ? "block" : "none";

  const statusEl = document.getElementById("result-status");
  if (data.status === "active") {
    statusEl.textContent = "Ativa";
    statusEl.className = "badge badge-active";
  } else {
    statusEl.textContent = "Encerrada";
    statusEl.className = "badge badge-closed";
  }

  document.getElementById("btn-go-vote").href = `vote.html?id=${data.id}`;

  const btnClose = document.getElementById("btn-close-poll");
  btnClose.style.display = data.status === "active" ? "inline-flex" : "none";

  renderChart(data.options, data.totalVotes);
}

function renderChart(options, totalVotes) {
  const chart = document.getElementById("results-chart");
  chart.innerHTML = "";

  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  options.forEach((opt) => {
    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
    const isWinner = opt.votes === maxVotes && opt.votes > 0;

    const item = document.createElement("div");
    item.className = "result-item";
    item.dataset.id = opt.id;
    item.innerHTML = `
      <div class="result-header">
        <span class="result-label">${escapeHtml(opt.text)}</span>
        <span class="result-meta">${opt.votes} voto(s) · ${pct}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill${isWinner ? " winner" : ""}" style="width:${pct}%"></div>
      </div>
    `;
    chart.appendChild(item);
  });

  document.getElementById("total-count").textContent = totalVotes;
}

function updateBar(optionId, votes, totalVotes) {
  const item = document.querySelector(`.result-item[data-id="${optionId}"]`);
  if (!item) return;

  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  item.querySelector(".result-meta").textContent = `${votes} voto(s) · ${pct}%`;
  item.querySelector(".bar-fill").style.width = `${pct}%`;
  document.getElementById("total-count").textContent = totalVotes;
}

function connectSocket(pollId) {
  try {
    ws = createSocket();
    ws.joinPoll(pollId);

    ws.on("vote_update", (data) => {
      data: {
        options: ([{ id, votes }], totalVotes);
      }
      data.options?.forEach((opt) =>
        updateBar(opt.id, opt.votes, data.totalVotes),
      );
    });

    ws.on("poll_closed", () => {
      document.getElementById("result-status").textContent = "Encerrada";
      document.getElementById("result-status").className = "badge badge-closed";
      document.getElementById("btn-close-poll").style.display = "none";
      showToast("Votação encerrada.", "default");
    });
  } catch {
    console.warn("[Socket] Indisponível.");
  }
}

async function closePollHandler() {
  if (!confirm("Encerrar esta votação? Esta ação não pode ser desfeita."))
    return;
  try {
    await closePoll(currentPollId);
    showToast("Votação encerrada.", "success");
    document.getElementById("btn-close-poll").style.display = "none";
    document.getElementById("result-status").textContent = "Encerrada";
    document.getElementById("result-status").className = "badge badge-closed";
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function exportCsv() {
  if (!currentPollId) {
    showToast("Nenhuma votação selecionada.", "error");
    return;
  }

  try {
    const data = await getResults(currentPollId);
    const rows = [["Opção", "Votos", "%"]];
    data.options.forEach((opt) => {
      const pct =
        data.totalVotes > 0
          ? ((opt.votes / data.totalVotes) * 100).toFixed(1)
          : "0.0";
      rows.push([opt.text, opt.votes, pct]);
    });
    rows.push(["Total", data.totalVotes, "100"]);

    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultado_${currentPollId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exportado!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function setState(state) {
  document.getElementById("state-empty").style.display =
    state === "empty" ? "block" : "none";
  document.getElementById("state-loading").style.display =
    state === "loading" ? "block" : "none";
  document.getElementById("state-results").style.display =
    state === "results" ? "block" : "none";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.addEventListener("beforeunload", () => ws?.destroy());
