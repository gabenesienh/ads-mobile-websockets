const SERVER_BASEURL = "localhost";
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_BASEURL}:${SERVER_PORT}`;

const inputTitulo = document.getElementById('poll-titulo');
const inputOpcoes = document.getElementsByClassName('poll-opcao');
const btnEnviar = document.getElementById('poll-enviar');

btnEnviar.onclick = async () => {
  const titulo = inputTitulo.value;
  const opcoes = [...inputOpcoes].map((opcao) => opcao.value);

  let res = await fetch(`http://${SERVER_URL}/api/polls`, {
    method: 'POST',
    body: JSON.stringify({ titulo, opcoes }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 201) {
    window.location.href = `/ver-poll?id=${data.pollId}`;
  }
}