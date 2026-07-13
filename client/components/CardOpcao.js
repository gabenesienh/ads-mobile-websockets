export const CardOpcao = (count) => `
  <div class="poll-opcao-container">
    <label for="poll-opcao-${count}">Opção ${count}:</label>
    <input type="text" id="poll-opcao-${count}" class="poll-opcao" autocomplete="off" />
  </div>
`;