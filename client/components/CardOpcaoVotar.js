export const CardOpcaoVotar = ({ opcaoId, desc, votos }) => `
  <div class="poll-votar-container">
    <text>
      ${desc}
    </text>
    <div>
      <text>
        Votos: <span id="poll-votos-${opcaoId}">${votos}</span>
      </text>
      <button id="poll-votar-${opcaoId}">
        Votar
      </button>
    </div>
  </div>
`;