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
    return;
  }

  // Preencher dados da poll na página
  divPollTitulo.innerHTML = data.titulo;

  for (let i = 0; i < data.opcoes.length; i++) {
    const novaOpcao = document.createElement('div');

    // Sim, isso não é nem um pouco seguro, mas eu já virei a noite fazendo essa
    // porcaria funcionar :^)))))))))
    divPollOpcoes.insertAdjacentHTML('beforeend', `
      <div>
        <label for="poll-votar-${i}">
          ${data.opcoes[i].desc}
        </label>
        <button id="poll-votar-${i}">Votar</button>
        <div id="poll-votos-${i}">
          ${data.opcoes[i].votos}
        </div>
      </div>
    `)

    // Registrar voto ao clicar o botão
    const btnVotar = document.getElementById(`poll-votar-${i}`);

    btnVotar.addEventListener('click', () => {
      socket.emit('votoEnviado', {
        pollId: pollId,
        opcaoId: i
      });
    });
  }
});

// Atualizar na tela o número de votos
socket.on('votoSucesso', ({ opcaoId, qtdVotos }) => {
  const opcaoVotada = document.getElementById(`poll-votos-${opcaoId}`);

  opcaoVotada.textContent = qtdVotos;
});