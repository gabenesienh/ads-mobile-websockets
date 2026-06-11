/**
 * socket.js — cliente WebSocket
 *
 * Uso:
 *   const ws = createSocket();
 *   ws.joinPoll('poll-id');
 *   ws.on('vote_update', (data) => { ... });
 *   ws.on('poll_closed', (data) => { ... });
 */

const WS_BASE =
  window.location.hostname === "localhost"
    ? "ws://localhost:3000"
    : `ws://${window.location.host}`;

function createSocket() {
  let socket = null;
  let currentPollId = null;
  const handlers = {};
  let reconnectTimer = null;
  let reconnectDelay = 1000;

  function connect() {
    socket = new WebSocket(WS_BASE);

    socket.addEventListener("open", () => {
      console.log("[WS] Conectado");
      reconnectDelay = 1000;
      if (currentPollId) joinPoll(currentPollId);
    });

    socket.addEventListener("message", (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      const { type, data } = msg;
      if (handlers[type]) handlers[type].forEach((fn) => fn(data));
      if (handlers["*"]) handlers["*"].forEach((fn) => fn(msg));
    });

    socket.addEventListener("close", () => {
      console.warn("[WS] Desconectado. Reconectando em", reconnectDelay, "ms…");
      reconnectTimer = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, 15000);
        connect();
      }, reconnectDelay);
    });

    socket.addEventListener("error", (err) => {
      console.error("[WS] Erro:", err);
    });
  }

  function send(type, data = {}) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    }
  }

  function joinPoll(pollId) {
    currentPollId = pollId;
    send("join_poll", { pollId });
  }

  function leavePoll() {
    if (currentPollId) send("leave_poll", { pollId: currentPollId });
    currentPollId = null;
  }

  function on(eventType, handler) {
    if (!handlers[eventType]) handlers[eventType] = [];
    handlers[eventType].push(handler);
  }

  function off(eventType, handler) {
    if (!handlers[eventType]) return;
    handlers[eventType] = handlers[eventType].filter((fn) => fn !== handler);
  }

  function destroy() {
    clearTimeout(reconnectTimer);
    leavePoll();
    socket?.close();
  }

  connect();

  return { on, off, joinPoll, leavePoll, send, destroy };
}
