// src/components/scoreDisplay.js
export function updateHUD(state) {
  const score  = document.getElementById('hud-score');
  const streak = document.getElementById('hud-streak');
  const lives  = document.getElementById('hud-lives');

  if (score)  score.textContent  = state.score;
  if (streak) streak.textContent = state.streak > 0 ? `🔥 ${state.streak}` : '—';
  if (lives)  lives.textContent  = (state.mode === 'story' || state.mode === 'boss')
    ? '❤️'.repeat(Math.max(0, state.lives))
    : '∞';
}
