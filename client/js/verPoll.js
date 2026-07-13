import { io } from 'https://cdn.socket.io/4.8.3/socket.io.esm.min.js';

const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_HOST}:${SERVER_PORT}`;
const WEBSOCKET_HOST = 'localhost';
const WEBSOCKET_PORT = 8080;
const WEBSOCKET_URL = `${WEBSOCKET_HOST}:${WEBSOCKET_PORT}`;

const socket = io(WEBSOCKET_URL);

const divPollTitulo = document.getElementById('poll-titulo');
const divPollOpcoes = document.getElementById('poll-opcoes');

// Carregar dados da poll ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const pollId = params.get('id');

  if (!pollId) return;

  let res = await fetch(`http://${SERVER_URL}/api/polls/${pollId}`, {
    method: 'GET',
  });

  let data = await res.json();

  // Poll não encontrada
  if (res.status === 404) {
    //TODO: lidar com erro
  }

  // Preencher dados da poll na página
  divPollTitulo.innerHTML = data.titulo;

  for (let i = 0; i < data.opcoes.length; i++) {
    divPollOpcoes.innerHTML +=
    `
      <div>
        <label for="poll-opcao-${i}">
          ${data.opcoes[i].desc}
        </label>
        <button id="poll-opcao-${i}">Votar</button>
      </div>
    `;
  }
});