// src/components/modal.js
export function showModal({ icon = '', title, body, actions = [] }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    ${icon ? `<div class="modal-icon">${icon}</div>` : ''}
    <div class="modal-title">${title}</div>
    <div class="modal-body">${body}</div>
    <div class="modal-actions" id="_modal-actions"></div>
  `;

  const actionsEl = modal.querySelector('#_modal-actions');
  actions.forEach(({ text, variant = 'primary', onClick }) => {
    const btn = document.createElement('button');
    btn.className = `btn btn-${variant}`;
    btn.textContent = text;
    btn.addEventListener('click', () => { backdrop.remove(); onClick?.(); });
    actionsEl.appendChild(btn);
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  return () => backdrop.remove();
}
