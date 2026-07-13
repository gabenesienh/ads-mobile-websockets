const SERVER_BASEURL = "localhost";
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_BASEURL}:${SERVER_PORT}`;

const divPollTitulo = document.getElementById('pollTitulo');
const divPollOpcoes = document.getElementById('pollOpcoes');

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

  for (const opcao of data.opcoes) {
    divPollOpcoes.innerHTML += `<div>${opcao.desc}</div>`;
  }
});