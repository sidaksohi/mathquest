// main.js
import {
  getState, resetSession, setMode, setQuestion,
  recordCorrect, recordIncorrect, setDifficulty,
  unlockChapter, startChapter, setBossActive,
} from './src/game/state.js';
import { generateQuestion, generateChoices, isCorrect } from './src/utils/math.js';
import { getHint, getWolframHint } from './src/utils/hints.js';
import { CHAPTERS, getChapter, checkMastery, getNextChapterId, isLastChapter } from './src/game/story.js';
import { getSkillForDifficulty, calcNewDifficulty, getDifficultyLabel } from './src/game/arcade.js';
import { getBoss } from './src/bosses/bosses.js';
import { createBossSession, getBossQuestion, recordBossAnswer, tickBossTimer } from './src/bosses/bossRunner.js';
import { updateHUD } from './src/components/scoreDisplay.js';
import { showModal } from './src/components/modal.js';

const WOLFRAM_APP_ID = window.WOLFRAM_APP_ID ?? null;

// ─── Screen routing ───────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${id}`).classList.add('active');
  const hud = document.getElementById('hud');
  hud.style.display = (id === 'menu' || id === 'story') ? 'none' : 'flex';
}

// ─── Feedback float ───────────────────────────────────────────────────────────
function showFeedback(emoji) {
  const el = document.getElementById('feedback-overlay');
  el.textContent = emoji;
  el.classList.remove('show');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('show');
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
function initMenu() {
  document.getElementById('menu-highscore').textContent = getState().highScore;
  document.getElementById('btn-story').onclick  = initStoryMap;
  document.getElementById('btn-arcade').onclick = startArcade;
  showScreen('menu');
}

// ─── Story Map ────────────────────────────────────────────────────────────────
function initStoryMap() {
  setMode('story');
  showScreen('story');
  const list  = document.getElementById('chapter-list');
  const state = getState();
  list.innerHTML = '';

  CHAPTERS.forEach(ch => {
    const unlocked  = state.story.unlockedChapters.includes(ch.id);
    const completed = state.story.unlockedChapters.includes(ch.id + 1);
    const card = document.createElement('div');
    card.className = `chapter-card ${unlocked ? '' : 'locked'} ${completed ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="chapter-icon">${completed ? '✅' : unlocked ? '⭐' : '🔒'}</div>
      <div class="chapter-info">
        <div class="chapter-title">Chapter ${ch.id}: ${ch.title}</div>
        <div class="chapter-subtitle">${ch.intro}</div>
      </div>
    `;
    if (unlocked) card.addEventListener('click', () => startStoryChapter(ch.id));
    list.appendChild(card);
  });

  document.getElementById('btn-story-back').onclick = () => {
    resetSession();
    initMenu();
  };
}

// ─── Story Chapter ────────────────────────────────────────────────────────────
function startStoryChapter(chapterId) {
  startChapter(chapterId);
  setMode('story');
  const ch = getChapter(chapterId);
  document.getElementById('mode-label').textContent = `📖 Ch.${ch.id}: ${ch.title}`;
  showScreen('game');
  nextStoryQuestion();
}

let hintUsed = false;

function nextStoryQuestion() {
  hintUsed = false;
  const state = getState();
  const ch = getChapter(state.story.chapter);

  if (state.lives <= 0) {
    showModal({
      icon: '💔', title: 'Oh no!',
      body: 'You ran out of lives. Keep practicing and try again!',
      actions: [
        { text: '🔄 Try Again', variant: 'primary',
          onClick: () => startStoryChapter(state.story.chapter) },
        { text: '🏠 Menu', variant: 'secondary',
          onClick: () => { resetSession(); initMenu(); } },
      ],
    });
    return;
  }

  if (checkMastery(ch, state.story.chapterCorrect, state.story.chapterTotal)) {
    triggerBoss(ch.bossId);
    return;
  }

  const q = generateQuestion(ch.skill);
  setQuestion(q);
  renderQuestion(q, 'story');
  updateHUD(getState());
}

// ─── Arcade ───────────────────────────────────────────────────────────────────
function startArcade() {
  resetSession();
  setMode('arcade');
  setDifficulty(1);
  document.getElementById('mode-label').textContent = '🎮 Arcade — Beginner';
  showScreen('game');
  nextArcadeQuestion();
}

function nextArcadeQuestion() {
  const state = getState();
  const skill = getSkillForDifficulty(state.difficulty);
  const q = generateQuestion(skill);
  setQuestion(q);
  document.getElementById('mode-label').textContent =
    `🎮 Arcade — ${getDifficultyLabel(state.difficulty)}`;
  renderQuestion(q, 'arcade');
  updateHUD(state);
}

// ─── Question rendering ───────────────────────────────────────────────────────
function renderQuestion(q, context) {
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('question-hint').textContent = '';

  const grid = document.getElementById('answer-grid');
  grid.innerHTML = '';
  generateChoices(q.answer, 4).forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-answer';
    btn.textContent = choice;
    btn.addEventListener('click', () => handleAnswer(choice, q, context, grid));
    grid.appendChild(btn);
  });

  const wrap = document.getElementById('hint-btn-wrap');
  wrap.innerHTML = '';
  const hintBtn = document.createElement('button');
  hintBtn.className = 'btn btn-accent';
  hintBtn.style.cssText = 'font-size:0.85em;padding:10px 20px;min-height:44px';
  hintBtn.textContent = '💡 Hint';
  hintBtn.addEventListener('click', async () => {
    if (hintUsed) return;
    hintUsed = true;
    document.getElementById('question-hint').textContent = '...';
    document.getElementById('question-hint').textContent =
      await getWolframHint(q, WOLFRAM_APP_ID);
  });
  wrap.appendChild(hintBtn);
}

let answerLocked = false;

function handleAnswer(chosen, q, context, grid) {
  if (answerLocked) return;
  answerLocked = true;

  const correct = isCorrect(chosen, q.answer);
  Array.from(grid.children).forEach(btn => {
    if (Number(btn.textContent) === q.answer) btn.classList.add('correct');
    else if (Number(btn.textContent) === chosen && !correct) btn.classList.add('incorrect');
    btn.disabled = true;
  });

  if (correct) {
    showFeedback('⭐');
    recordCorrect();
    if (context === 'arcade') setDifficulty(calcNewDifficulty(getState().score));
  } else {
    showFeedback('💪');
    recordIncorrect();
    if (!document.getElementById('question-hint').textContent)
      document.getElementById('question-hint').textContent = getHint(q);
  }

  updateHUD(getState());
  setTimeout(() => {
    answerLocked = false;
    context === 'story' ? nextStoryQuestion() : nextArcadeQuestion();
  }, 1000);
}

// ─── Boss Battle ──────────────────────────────────────────────────────────────
let bossSession = null;
let bossInterval = null;

function triggerBoss(bossId) {
  const boss = getBoss(bossId);
  setBossActive(boss);
  bossSession = createBossSession(boss);
  showModal({
    icon: boss.emoji, title: `Boss Fight: ${boss.name}`,
    body: boss.description,
    actions: [{ text: '⚔️ Fight!', variant: 'secondary', onClick: startBossBattle }],
  });
}

function startBossBattle() {
  showScreen('boss');
  const { boss } = bossSession;
  document.getElementById('boss-emoji').textContent = boss.emoji;
  document.getElementById('boss-name').textContent  = boss.name;
  document.getElementById('boss-desc').textContent  = boss.description;
  refreshBossUI();
  renderBossQuestion();
  clearInterval(bossInterval);
  bossInterval = setInterval(() => {
    tickBossTimer(bossSession);
    refreshBossUI();
    if (bossSession.finished) { clearInterval(bossInterval); endBoss(); }
  }, 1000);
}

function refreshBossUI() {
  const { timeRemaining, questionsCorrect, boss } = bossSession;
  const timerEl = document.getElementById('boss-timer');
  timerEl.textContent = `⏱ ${timeRemaining}s`;
  timerEl.className = `boss-timer${timeRemaining <= 10 ? ' urgent' : ''}`;
  document.getElementById('boss-progress').textContent =
    `${questionsCorrect} / ${boss.questionCount} correct`;
}

function renderBossQuestion() {
  const q = getBossQuestion(bossSession);
  document.getElementById('boss-question').textContent = q.question;
  const grid = document.getElementById('boss-answer-grid');
  grid.innerHTML = '';
  generateChoices(q.answer, 4).forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-answer';
    btn.textContent = choice;
    btn.addEventListener('click', () => handleBossAnswer(choice, q, grid));
    grid.appendChild(btn);
  });
}

let bossAnswerLocked = false;

function handleBossAnswer(chosen, q, grid) {
  if (bossAnswerLocked || bossSession.finished) return;
  bossAnswerLocked = true;

  const correct = isCorrect(chosen, q.answer);
  Array.from(grid.children).forEach(btn => {
    if (Number(btn.textContent) === q.answer) btn.classList.add('correct');
    else if (Number(btn.textContent) === chosen && !correct) btn.classList.add('incorrect');
    btn.disabled = true;
  });

  recordBossAnswer(bossSession, correct);
  showFeedback(correct ? '⭐' : '💪');
  refreshBossUI();

  if (bossSession.finished) {
    clearInterval(bossInterval);
    setTimeout(endBoss, 800);
  } else {
    setTimeout(() => { bossAnswerLocked = false; renderBossQuestion(); }, 700);
  }
}

function endBoss() {
  clearInterval(bossInterval);
  const { boss, victory } = bossSession;
  const state = getState();

  if (victory) {
    const nextId = getNextChapterId(state.story.chapter);
    if (nextId) unlockChapter(nextId);
    showModal({
      icon: '🏆', title: 'You Won!',
      body: boss.victoryMessage,
      actions: [
        isLastChapter(state.story.chapter)
          ? { text: '🎉 Game Complete!', variant: 'accent',
              onClick: () => { resetSession(); initMenu(); } }
          : { text: '➡️ Next Chapter', variant: 'primary', onClick: initStoryMap },
        { text: '🏠 Menu', variant: 'secondary',
          onClick: () => { resetSession(); initMenu(); } },
      ],
    });
  } else {
    showModal({
      icon: '😓', title: 'So close!',
      body: 'You almost had it! Practice more and try again!',
      actions: [
        { text: '🔄 Try Again', variant: 'primary', onClick: () => {
          bossSession = createBossSession(boss);
          startBossBattle();
        }},
        { text: '📖 Practice', variant: 'secondary',
          onClick: () => startStoryChapter(state.story.chapter) },
      ],
    });
  }
}

// ─── Nav buttons ──────────────────────────────────────────────────────────────
document.getElementById('btn-game-back').addEventListener('click', () => {
  clearInterval(bossInterval);
  resetSession();
  initMenu();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
initMenu();
