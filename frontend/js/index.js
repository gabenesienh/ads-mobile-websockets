document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupOptionBuilder();
  setupCreateForm();
  await loadPolls();

  document.getElementById("btn-refresh").addEventListener("click", loadPolls);
}

function setupCreateForm() {
  const form = document.getElementById("form-create");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("poll-title").value.trim();
    const description = document.getElementById("poll-desc").value.trim();
    const voteLimit = parseInt(document.getElementById("poll-limit").value, 10);
    const expiresAt = document.getElementById("poll-expires").value || null;

    const optionInputs = [
      ...document.querySelectorAll("#options-list .option-row input"),
    ];
    const options = optionInputs.map((i) => i.value.trim()).filter(Boolean);

    // Validações
    if (!title) {
      showToast("Insira um título para a votação.", "error");
      return;
    }
    if (options.length < 2) {
      showToast("Adicione pelo menos 2 opções.", "error");
      return;
    }

    const btn = document.getElementById("btn-create");
    btn.disabled = true;
    btn.textContent = "Criando…";

    try {
      const poll = await createPoll({
        title,
        description,
        options,
        voteLimit,
        expiresAt,
      });
      showToast("Votação criada com sucesso!", "success");
      form.reset();
      resetOptionBuilder();
      await loadPolls();

      document
        .getElementById("polls-list")
        .scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      showToast(err.message || "Erro ao criar votação.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Criar votação";
    }
  });
}

function setupOptionBuilder() {
  document.getElementById("add-option").addEventListener("click", addOptionRow);
  document.getElementById("options-list").addEventListener("click", (e) => {
    if (e.target.closest(".remove-option")) {
      const rows = document.querySelectorAll("#options-list .option-row");
      if (rows.length <= 2) {
        showToast("Mantenha pelo menos 2 opções.", "error");
        return;
      }
      e.target.closest(".option-row").remove();
      renumberOptions();
    }
  });
}

function addOptionRow() {
  const list = document.getElementById("options-list");
  const count = list.querySelectorAll(".option-row").length + 1;
  const row = document.createElement("div");
  row.className = "option-row form-row";
  row.innerHTML = `
    <div class="form-group">
      <input type="text" placeholder="Opção ${count}" maxlength="80" />
    </div>
    <button type="button" class="btn btn-outline remove-option" title="Remover"
      style="height:40px;padding:0 14px;margin-bottom:18px">✕</button>
  `;
  list.appendChild(row);
  row.querySelector("input").focus();
}

function renumberOptions() {
  document
    .querySelectorAll("#options-list .option-row input")
    .forEach((input, i) => {
      if (!input.value) input.placeholder = `Opção ${i + 1}`;
    });
}

function resetOptionBuilder() {
  const list = document.getElementById("options-list");
  list.innerHTML = `
    <div class="option-row form-row">
      <div class="form-group"><input type="text" placeholder="Opção 1" maxlength="80" /></div>
      <button type="button" class="btn btn-outline remove-option" style="height:40px;padding:0 14px;margin-bottom:18px">✕</button>
    </div>
    <div class="option-row form-row">
      <div class="form-group"><input type="text" placeholder="Opção 2" maxlength="80" /></div>
      <button type="button" class="btn btn-outline remove-option" style="height:40px;padding:0 14px;margin-bottom:18px">✕</button>
    </div>
  `;
}

async function loadPolls() {
  const container = document.getElementById("polls-list");
  container.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Carregando…</span></div>`;

  try {
    const polls = await getPolls();

    if (!polls || polls.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div style="font-size:1.8rem">🗳️</div>
          <p>Nenhuma votação criada ainda.</p>
        </div>`;
      return;
    }

    container.innerHTML = "";
    polls.forEach((poll) => container.appendChild(renderPollRow(poll)));
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p style="color:var(--danger)">Erro ao carregar: ${err.message}</p>
      </div>`;
  }
}

function renderPollRow(poll) {
  const div = document.createElement("div");
  div.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);flex-wrap:wrap";

  const statusLabel =
    poll.status === "active"
      ? "Ativa"
      : poll.status === "closed"
        ? "Encerrada"
        : "Pendente";
  const badgeClass =
    poll.status === "active"
      ? "badge-active"
      : poll.status === "closed"
        ? "badge-closed"
        : "badge-pending";

  div.innerHTML = `
    <div style="flex:1;min-width:0">
      <div style="font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        ${escapeHtml(poll.title)}
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">
        ${poll.totalVotes ?? 0} voto(s) · ${poll.options?.length ?? 0} opções
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
      <span class="badge ${badgeClass}">${statusLabel}</span>
      <a href="vote.html?id=${poll.id}" class="btn btn-outline" style="padding:5px 12px;font-size:0.8rem">Votar</a>
      <a href="results.html?id=${poll.id}" class="btn btn-outline" style="padding:5px 12px;font-size:0.8rem">Ver</a>
      <button class="btn btn-danger btn-delete" data-id="${poll.id}"
        style="padding:5px 12px;font-size:0.8rem">🗑</button>
    </div>
  `;

  div.querySelector(".btn-delete").addEventListener("click", async (e) => {
    const id = e.currentTarget.dataset.id;
    if (!confirm("Remover esta votação permanentemente?")) return;
    try {
      await deletePoll(id);
      showToast("Votação removida.", "success");
      div.remove();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  return div;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
