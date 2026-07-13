const SERVER_BASEURL = "localhost";
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_BASEURL}:${SERVER_PORT}`;

const divPollTitulo = document.getElementById('pollTitulo');
const divPollOpcao1 = document.getElementById('pollOpcao1');
const divPollOpcao2 = document.getElementById('pollOpcao2');

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

  divPollTitulo.innerHTML = data.titulo;
  divPollOpcao1.innerHTML = data.opcao1;
  divPollOpcao2.innerHTML = data.opcao2;
});