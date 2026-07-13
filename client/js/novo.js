import { CardOpcao } from '/components/CardOpcao.js';

const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;
const SERVER_URL = `${SERVER_HOST}:${SERVER_PORT}`;

const inputTitulo = document.getElementById('poll-titulo');

const ctnrOpcoes = document.getElementsByClassName('poll-opcao-container');
const inputOpcoes = document.getElementsByClassName('poll-opcao');

const ctnrBtnsAddRmOpcao = document.getElementById('poll-botoes-add-rm');
const btnRmOpcao = document.getElementById('poll-rm-opcao');
const btnAddOpcao = document.getElementById('poll-add-opcao');
const btnEnviar = document.getElementById('poll-enviar');

// Adiciona mais um card de opção à lista de opções
function addOpcao() {
  if (inputOpcoes.length >= 6) {
    //TODO: lidar com erro
    return;
  }

  ctnrBtnsAddRmOpcao.insertAdjacentHTML(
    'beforebegin',
    CardOpcao(inputOpcoes.length + 1)
  );
}

// Remove o último card da lista de opções
function rmOpcao() {
  if (inputOpcoes.length <= 2) {
    //TODO: lidar com erro
    return;
  }

  ctnrOpcoes[ctnrOpcoes.length - 1].remove();
}

// Adicionar duas opções por padrão
document.addEventListener('DOMContentLoaded', () => {
  addOpcao();
  addOpcao();
});

// Enviar dados da poll a ser criada
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

// Botão de adicionar mais uma opção
btnAddOpcao.onclick = () => {
  addOpcao();
}

// Botão de remover última opção
btnRmOpcao.onclick = () => {
  rmOpcao();
}