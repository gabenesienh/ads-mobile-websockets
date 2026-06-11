/**
 * toast.js — notificações temporárias
 * Uso: showToast('Mensagem') | showToast('Erro!', 'error') | showToast('Ok', 'success')
 */

function showToast(message, type = 'default', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast${type !== 'default' ? ' ' + type : ''}`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.style.transition = 'opacity 0.25s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 280);
  }, duration);
}