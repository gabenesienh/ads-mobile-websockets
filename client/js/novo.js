const SERVER_BASEURL = "localhost";
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_BASEURL}:${SERVER_PORT}`;

const inputTitulo = document.getElementById('poll-titulo');
const inputOpcao1 = document.getElementById('poll-opcao-1');
const inputOpcao2 = document.getElementById('poll-opcao-2');
const btnEnviar = document.getElementById('poll-enviar');

btnEnviar.onclick = async () => {
  const titulo = inputTitulo.value;
  const opcao1 = inputOpcao1.value;
  const opcao2 = inputOpcao2.value;

  await fetch(`http://${SERVER_URL}/api/polls`, {
    method: 'POST',
    body: JSON.stringify({ titulo, opcao1, opcao2 }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}