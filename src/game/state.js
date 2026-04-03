// src/game/state.js
const STORAGE_KEY = 'mathquest_v1';

const DEFAULT_STORY = {
  chapter: 1,
  chapterCorrect: 0,
  chapterTotal: 0,
  unlockedChapters: [1],
  bossActive: false,
};

function makeDefault() {
  return {
    mode: 'menu',
    score: 0,
    streak: 0,
    highScore: 0,
    difficulty: 1,
    currentQuestion: null,
    story: { ...DEFAULT_STORY, unlockedChapters: [...DEFAULT_STORY.unlockedChapters] },
    boss: null,
    lives: 3,
  };
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw);
    return {
      highScore: p.highScore || 0,
      story: { unlockedChapters: p.unlockedChapters || [1] },
    };
  } catch { return {}; }
}

function makeFresh() {
  const p = loadPersisted();
  const s = makeDefault();
  s.highScore = p.highScore || 0;
  s.story.unlockedChapters = p.story?.unlockedChapters || [1];
  return s;
}

let state = makeFresh();

export function getState() { return state; }

export function resetSession() {
  const saved = {
    highScore: state.highScore,
    unlockedChapters: [...state.story.unlockedChapters],
  };
  state = makeDefault();
  state.highScore = saved.highScore;
  state.story.unlockedChapters = saved.unlockedChapters;
}

export function setMode(mode) { state.mode = mode; }
export function setQuestion(q) { state.currentQuestion = q; }

export function recordCorrect() {
  state.streak += 1;
  const mult = state.streak >= 10 ? 3
    : state.streak >= 5 ? 2
    : state.streak >= 3 ? 1.5
    : 1;
  state.score += Math.round(10 * state.difficulty * mult);
  if (state.score > state.highScore) state.highScore = state.score;
  state.story.chapterCorrect += 1;
  state.story.chapterTotal += 1;
  _persist();
}

export function recordIncorrect() {
  state.streak = 0;
  state.story.chapterTotal += 1;
  if (state.mode === 'story' || state.mode === 'boss') {
    state.lives = Math.max(0, state.lives - 1);
  }
}

export function setDifficulty(level) {
  state.difficulty = Math.max(1, Math.min(5, level));
}

export function unlockChapter(id) {
  if (!state.story.unlockedChapters.includes(id)) {
    state.story.unlockedChapters.push(id);
    _persist();
  }
}

export function startChapter(id) {
  state.story.chapter = id;
  state.story.chapterCorrect = 0;
  state.story.chapterTotal = 0;
  state.story.bossActive = false;
  state.lives = 3;
  state.boss = null;
}

export function setBossActive(boss) {
  state.story.bossActive = true;
  state.boss = boss;
  state.mode = 'boss';
}

function _persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      highScore: state.highScore,
      unlockedChapters: state.story.unlockedChapters,
    }));
  } catch { /* localStorage unavailable */ }
}
