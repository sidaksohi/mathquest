// src/components/button.js
export function createButton({ text, variant = 'primary', onClick, icon = '' }) {
  const btn = document.createElement('button');
  btn.className = `btn btn-${variant}`;
  btn.innerHTML = icon ? `${icon} ${text}` : text;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}
