const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : window.location.origin;

function createSocket() {
  const socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
  });

  socket.on("connect", () => {
    console.log("[Socket.io] Conectado:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[Socket.io] Desconectado:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket.io] Erro de conexão:", err.message);
  });

  function joinPoll(pollId) {
    socket.emit("join_poll", { pollId });
  }

  function leavePoll(pollId) {
    socket.emit("leave_poll", { pollId });
  }

  function on(event, handler) {
    socket.on(event, handler);
  }

  function off(event, handler) {
    socket.off(event, handler);
  }

  function destroy() {
    socket.disconnect();
  }

  return { on, off, joinPoll, leavePoll, destroy };
}
