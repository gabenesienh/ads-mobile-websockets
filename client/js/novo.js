const SERVER_BASEURL = "localhost";
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_BASEURL}:${SERVER_PORT}`;

const inputPollPergunta = document.getElementById('poll-pergunta');
const btnEnviar = document.getElementById('poll-enviar');

btnEnviar.onclick = async () => {
  const pergunta = inputPollPergunta.value;

  await fetch(`http://${SERVER_URL}/api/polls`, {
    method: 'POST',
    body: JSON.stringify({ pergunta }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}