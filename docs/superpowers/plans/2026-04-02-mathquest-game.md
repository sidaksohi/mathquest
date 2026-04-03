# MathQuest Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, modular, vanilla JS math game for K–2nd graders with Story Mode, Arcade Mode, boss battles, TDD, and gamified UX.

**Architecture:** ES modules loaded via `<script type="module">`. State is centralized in `state.js` and mutated only there. UI reads state; game logic (arcade/story) is pure-function logic only, never touching the DOM.

**Tech Stack:** HTML5, CSS3 custom properties, Vanilla ES Modules, in-browser test harness (no npm, no build step).

---

## File Map

| File | Responsibility |
|------|---------------|
| `tests/harness.js` | Minimal test framework: describe/it/expect |
| `tests/runner.html` | Visual test runner, imports all test files |
| `tests/math.test.js` | Tests for question gen, choices, isCorrect |
| `tests/state.test.js` | Tests for all state transitions |
| `tests/story.test.js` | Tests for chapter/mastery/boss logic |
| `tests/arcade.test.js` | Tests for skill selection, scoring, difficulty |
| `tests/boss.test.js` | Tests for boss session creation, answer recording, timer |
| `src/utils/math.js` | `generateQuestion`, `generateChoices`, `isCorrect`, `SKILLS` |
| `src/utils/hints.js` | `getHint`, `getWolframHint` |
| `src/game/state.js` | Centralized mutable state + localStorage persistence |
| `src/game/story.js` | `CHAPTERS`, `getChapter`, `checkMastery`, `getNextChapterId` |
| `src/game/arcade.js` | `getSkillForDifficulty`, `calcScoreGain`, `calcNewDifficulty` |
| `src/bosses/bosses.js` | `BOSSES` array, `getBoss(id)` |
| `src/bosses/bossRunner.js` | `createBossSession`, `getBossQuestion`, `recordBossAnswer`, `tickBossTimer` |
| `src/components/button.js` | `createButton` factory |
| `src/components/modal.js` | `showModal` |
| `src/components/scoreDisplay.js` | `updateHUD` |
| `src/styles/main.css` | Full stylesheet: variables, layout, animations |
| `index.html` | Entry point with all screen markup |
| `main.js` | Game bootstrap: screen routing, event wiring, game loops |

---

## Task 1: Test Harness

**Files:**
- Create: `tests/harness.js`
- Create: `tests/runner.html`

- [ ] **Step 1: Write harness.js**

```js
// tests/harness.js
const results = [];

export function describe(name, fn) {
  try { fn(); } catch (e) { console.error(`Suite error: ${name}`, e); }
}

export function it(description, fn) {
  try {
    fn();
    results.push({ pass: true, description });
    console.log(`✅ ${description}`);
  } catch (e) {
    results.push({ pass: false, description, error: e.message });
    console.error(`❌ ${description}: ${e.message}`);
  }
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected) {
      const a = JSON.stringify(actual), b = JSON.stringify(expected);
      if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
    },
    toBeGreaterThan(n) {
      if (actual <= n) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeLessThanOrEqual(n) {
      if (actual > n) throw new Error(`Expected ${actual} <= ${n}`);
    },
    toBeTrue() {
      if (actual !== true) throw new Error(`Expected true, got ${actual}`);
    },
    toBeFalse() {
      if (actual !== false) throw new Error(`Expected false, got ${actual}`);
    },
    toHaveLength(len) {
      if (actual.length !== len)
        throw new Error(`Expected length ${len}, got ${actual.length}`);
    },
  };
}

export function getResults() { return results; }
```

- [ ] **Step 2: Write runner.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MathQuest Tests</title>
  <style>
    body { font-family: monospace; padding: 24px; background: #1a1a2e; color: #eee; }
    h1 { color: #e94560; margin-bottom: 16px; }
    .pass { color: #43e97b; padding: 4px 0; }
    .fail { color: #e94560; padding: 4px 0; }
    .summary { margin-top: 24px; font-size: 1.3em; font-weight: bold; padding: 12px;
               background: #16213e; border-radius: 8px; }
    .summary.pass { border-left: 4px solid #43e97b; }
    .summary.fail { border-left: 4px solid #e94560; }
  </style>
</head>
<body>
  <h1>🧪 MathQuest Test Runner</h1>
  <div id="output"></div>
  <script type="module">
    import { getResults } from './harness.js';
    import './math.test.js';
    import './state.test.js';
    import './story.test.js';
    import './arcade.test.js';
    import './boss.test.js';

    const results = getResults();
    const output = document.getElementById('output');

    results.forEach(r => {
      const div = document.createElement('div');
      div.className = r.pass ? 'pass' : 'fail';
      div.textContent = `${r.pass ? '✅' : '❌'} ${r.description}${r.error ? ': ' + r.error : ''}`;
      output.appendChild(div);
    });

    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    const summary = document.createElement('div');
    summary.className = `summary ${passed === total ? 'pass' : 'fail'}`;
    summary.textContent = `${passed} / ${total} tests passed`;
    output.appendChild(summary);
  </script>
</body>
</html>
```

- [ ] **Step 3: Commit**
```bash
git add tests/harness.js tests/runner.html
git commit -m "feat: add in-browser test harness"
```

---

## Task 2: Math Utilities (TDD)

**Files:**
- Create: `src/utils/math.js`
- Create: `tests/math.test.js`

- [ ] **Step 1: Write failing tests (math.test.js)**

```js
// tests/math.test.js
import { describe, it, expect } from './harness.js';
import { generateQuestion, generateChoices, isCorrect, SKILLS } from '../src/utils/math.js';

describe('generateQuestion - single-digit addition', () => {
  it('returns question/answer/operands/operator fields', () => {
    const q = generateQuestion(SKILLS.SINGLE_DIGIT_ADD);
    expect(typeof q.question).toBe('string');
    expect(typeof q.answer).toBe('number');
    expect(Array.isArray(q.operands)).toBeTrue();
    expect(typeof q.operator).toBe('string');
  });
  it('answer equals sum of operands', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(SKILLS.SINGLE_DIGIT_ADD);
      expect(q.answer).toBe(q.operands[0] + q.operands[1]);
    }
  });
  it('operands are 1–9', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(SKILLS.SINGLE_DIGIT_ADD);
      expect(q.operands[0] >= 1 && q.operands[0] <= 9).toBeTrue();
      expect(q.operands[1] >= 1 && q.operands[1] <= 9).toBeTrue();
    }
  });
});

describe('generateQuestion - double-digit addition', () => {
  it('operands are 10–99', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(SKILLS.DOUBLE_DIGIT_ADD);
      expect(q.operands[0] >= 10 && q.operands[0] <= 99).toBeTrue();
      expect(q.operands[1] >= 10 && q.operands[1] <= 99).toBeTrue();
    }
  });
  it('answer equals sum of operands', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(SKILLS.DOUBLE_DIGIT_ADD);
      expect(q.answer).toBe(q.operands[0] + q.operands[1]);
    }
  });
});

describe('generateQuestion - single-digit subtraction', () => {
  it('answer is always >= 0', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(SKILLS.SINGLE_DIGIT_SUB);
      expect(q.answer >= 0).toBeTrue();
    }
  });
  it('answer equals a - b', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(SKILLS.SINGLE_DIGIT_SUB);
      expect(q.answer).toBe(q.operands[0] - q.operands[1]);
    }
  });
});

describe('generateQuestion - double-digit subtraction', () => {
  it('answer is always >= 0', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(SKILLS.DOUBLE_DIGIT_SUB);
      expect(q.answer >= 0).toBeTrue();
    }
  });
});

describe('generateChoices', () => {
  it('returns exactly 4 choices by default', () => {
    expect(generateChoices(10, 4)).toHaveLength(4);
  });
  it('always includes the correct answer', () => {
    for (let i = 0; i < 20; i++) {
      const choices = generateChoices(7, 4);
      expect(choices.includes(7)).toBeTrue();
    }
  });
  it('all choices are >= 0', () => {
    for (let i = 0; i < 20; i++) {
      const choices = generateChoices(1, 4);
      choices.forEach(c => expect(c >= 0).toBeTrue());
    }
  });
});

describe('isCorrect', () => {
  it('true for matching numbers', () => { expect(isCorrect(5, 5)).toBeTrue(); });
  it('false for non-matching', () => { expect(isCorrect(4, 5)).toBeFalse(); });
  it('coerces string to number', () => { expect(isCorrect('5', 5)).toBeTrue(); });
});
```

- [ ] **Step 2: Implement math.js**

```js
// src/utils/math.js
export const SKILLS = {
  SINGLE_DIGIT_ADD: 'single-digit-addition',
  DOUBLE_DIGIT_ADD: 'double-digit-addition',
  SINGLE_DIGIT_SUB: 'single-digit-subtraction',
  DOUBLE_DIGIT_SUB: 'double-digit-subtraction',
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function singleDigitAdd() {
  const a = randInt(1, 9), b = randInt(1, 9);
  return { question: `${a} + ${b} = ?`, answer: a + b, operands: [a, b], operator: '+' };
}
function doubleDigitAdd() {
  const a = randInt(10, 99), b = randInt(10, 99);
  return { question: `${a} + ${b} = ?`, answer: a + b, operands: [a, b], operator: '+' };
}
function singleDigitSub() {
  const a = randInt(2, 9), b = randInt(1, a);
  return { question: `${a} - ${b} = ?`, answer: a - b, operands: [a, b], operator: '-' };
}
function doubleDigitSub() {
  const a = randInt(20, 99), b = randInt(10, a);
  return { question: `${a} - ${b} = ?`, answer: a - b, operands: [a, b], operator: '-' };
}

const GENERATORS = {
  [SKILLS.SINGLE_DIGIT_ADD]: singleDigitAdd,
  [SKILLS.DOUBLE_DIGIT_ADD]: doubleDigitAdd,
  [SKILLS.SINGLE_DIGIT_SUB]: singleDigitSub,
  [SKILLS.DOUBLE_DIGIT_SUB]: doubleDigitSub,
};

export function generateQuestion(skill) {
  const gen = GENERATORS[skill];
  if (!gen) throw new Error(`Unknown skill: ${skill}`);
  return gen();
}

export function generateChoices(answer, count = 4) {
  const choices = new Set([answer]);
  let attempts = 0;
  while (choices.size < count && attempts < 100) {
    attempts++;
    const offset = randInt(-10, 10);
    if (offset !== 0) choices.add(Math.max(0, answer + offset));
  }
  // Pad with sequential fallback if still short
  let pad = 1;
  while (choices.size < count) {
    choices.add(Math.max(0, answer + pad));
    pad++;
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

export function isCorrect(userAnswer, correctAnswer) {
  return Number(userAnswer) === Number(correctAnswer);
}
```

- [ ] **Step 3: Commit**
```bash
git add src/utils/math.js tests/math.test.js
git commit -m "feat: math utilities with TDD (question gen, choices, isCorrect)"
```

---

## Task 3: Game State (TDD)

**Files:**
- Create: `src/game/state.js`
- Create: `tests/state.test.js`

- [ ] **Step 1: Write failing tests (state.test.js)**

```js
// tests/state.test.js
import { describe, it, expect } from './harness.js';
import {
  getState, resetSession, setMode, setQuestion,
  recordCorrect, recordIncorrect, setDifficulty,
  unlockChapter, startChapter, setBossActive,
} from '../src/game/state.js';

describe('initial state', () => {
  it('mode is menu', () => { resetSession(); expect(getState().mode).toBe('menu'); });
  it('score is 0', () => { resetSession(); expect(getState().score).toBe(0); });
  it('streak is 0', () => { resetSession(); expect(getState().streak).toBe(0); });
  it('lives is 3', () => { resetSession(); expect(getState().lives).toBe(3); });
  it('difficulty is 1', () => { resetSession(); expect(getState().difficulty).toBe(1); });
});

describe('setMode', () => {
  it('changes mode to arcade', () => {
    resetSession(); setMode('arcade');
    expect(getState().mode).toBe('arcade');
  });
});

describe('setQuestion', () => {
  it('stores current question', () => {
    resetSession();
    const q = { question: '1 + 1 = ?', answer: 2, operands: [1, 1], operator: '+' };
    setQuestion(q);
    expect(getState().currentQuestion.answer).toBe(2);
  });
});

describe('recordCorrect', () => {
  it('increments streak', () => {
    resetSession(); recordCorrect();
    expect(getState().streak).toBe(1);
  });
  it('adds score (base 10 × difficulty)', () => {
    resetSession(); setDifficulty(1); recordCorrect();
    expect(getState().score).toBe(10);
  });
  it('applies 1.5x multiplier at streak 3', () => {
    resetSession(); setDifficulty(1);
    recordCorrect(); recordCorrect(); // streak 1, 2
    const before = getState().score;
    recordCorrect(); // streak 3 → 1.5x
    expect(getState().score - before).toBe(15);
  });
  it('applies 2x multiplier at streak 5', () => {
    resetSession(); setDifficulty(1);
    recordCorrect(); recordCorrect(); recordCorrect(); recordCorrect();
    const before = getState().score;
    recordCorrect(); // streak 5
    expect(getState().score - before).toBe(20);
  });
  it('applies 3x multiplier at streak 10', () => {
    resetSession(); setDifficulty(1);
    for (let i = 0; i < 9; i++) recordCorrect();
    const before = getState().score;
    recordCorrect(); // streak 10
    expect(getState().score - before).toBe(30);
  });
  it('increments chapterCorrect', () => {
    resetSession(); recordCorrect();
    expect(getState().story.chapterCorrect).toBe(1);
  });
  it('updates highScore when score exceeds it', () => {
    resetSession(); recordCorrect();
    expect(getState().highScore).toBe(getState().score);
  });
});

describe('recordIncorrect', () => {
  it('resets streak to 0', () => {
    resetSession(); recordCorrect(); recordCorrect(); recordIncorrect();
    expect(getState().streak).toBe(0);
  });
  it('does not decrease score', () => {
    resetSession(); recordCorrect();
    const score = getState().score;
    recordIncorrect();
    expect(getState().score).toBe(score);
  });
  it('decrements lives in story mode', () => {
    resetSession(); setMode('story'); startChapter(1);
    recordIncorrect();
    expect(getState().lives).toBe(2);
  });
  it('does not decrement lives in arcade mode', () => {
    resetSession(); setMode('arcade');
    recordIncorrect();
    expect(getState().lives).toBe(3);
  });
});

describe('setDifficulty', () => {
  it('clamps to min 1', () => { resetSession(); setDifficulty(0); expect(getState().difficulty).toBe(1); });
  it('clamps to max 5', () => { resetSession(); setDifficulty(99); expect(getState().difficulty).toBe(5); });
  it('sets valid value', () => { resetSession(); setDifficulty(3); expect(getState().difficulty).toBe(3); });
});

describe('unlockChapter', () => {
  it('adds chapter to unlockedChapters', () => {
    resetSession(); unlockChapter(2);
    expect(getState().story.unlockedChapters.includes(2)).toBeTrue();
  });
  it('does not duplicate chapters', () => {
    resetSession(); unlockChapter(2); unlockChapter(2);
    expect(getState().story.unlockedChapters.filter(c => c === 2).length).toBe(1);
  });
});

describe('startChapter', () => {
  it('resets chapterCorrect and chapterTotal', () => {
    resetSession(); recordCorrect(); startChapter(1);
    expect(getState().story.chapterCorrect).toBe(0);
    expect(getState().story.chapterTotal).toBe(0);
  });
  it('resets lives to 3', () => {
    resetSession(); setMode('story'); recordIncorrect(); startChapter(1);
    expect(getState().lives).toBe(3);
  });
  it('sets chapter id', () => {
    resetSession(); startChapter(2);
    expect(getState().story.chapter).toBe(2);
  });
});

describe('setBossActive', () => {
  it('sets mode to boss', () => {
    resetSession(); setBossActive({ id: 1, name: 'Test Boss' });
    expect(getState().mode).toBe('boss');
  });
  it('stores the boss', () => {
    resetSession(); setBossActive({ id: 1, name: 'Test Boss' });
    expect(getState().boss.id).toBe(1);
  });
});
```

- [ ] **Step 2: Implement state.js**

```js
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
    story: { ...DEFAULT_STORY },
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
  const saved = { highScore: state.highScore, unlockedChapters: state.story.unlockedChapters };
  state = makeDefault();
  state.highScore = saved.highScore;
  state.story.unlockedChapters = saved.unlockedChapters;
}

export function setMode(mode) { state.mode = mode; }
export function setQuestion(q) { state.currentQuestion = q; }

export function recordCorrect() {
  state.streak += 1;
  const mult = state.streak >= 10 ? 3 : state.streak >= 5 ? 2 : state.streak >= 3 ? 1.5 : 1;
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
```

- [ ] **Step 3: Commit**
```bash
git add src/game/state.js tests/state.test.js
git commit -m "feat: centralized game state with localStorage persistence (TDD)"
```

---

## Task 4: Story Logic (TDD)

**Files:**
- Create: `src/game/story.js`
- Create: `tests/story.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/story.test.js
import { describe, it, expect } from './harness.js';
import { CHAPTERS, getChapter, checkMastery, isBossReady, getNextChapterId, isLastChapter } from '../src/game/story.js';

describe('getChapter', () => {
  it('returns chapter by id', () => { expect(getChapter(1).id).toBe(1); });
  it('returns null for unknown id', () => { expect(getChapter(99)).toBe(null); });
  it('chapter 1 uses single-digit-addition', () => {
    expect(getChapter(1).skill).toBe('single-digit-addition');
  });
  it('chapter 2 uses double-digit-addition', () => {
    expect(getChapter(2).skill).toBe('double-digit-addition');
  });
});

describe('checkMastery', () => {
  const ch = { masteryCorrect: 8, masteryTotal: 10 };
  it('false when total < masteryTotal', () => { expect(checkMastery(ch, 8, 9)).toBeFalse(); });
  it('false when correct < masteryCorrect', () => { expect(checkMastery(ch, 7, 10)).toBeFalse(); });
  it('true when threshold met', () => { expect(checkMastery(ch, 8, 10)).toBeTrue(); });
  it('true when above threshold', () => { expect(checkMastery(ch, 10, 10)).toBeTrue(); });
});

describe('isBossReady', () => {
  const ch = { masteryCorrect: 8, masteryTotal: 10 };
  it('false when total < masteryTotal', () => { expect(isBossReady(ch, 10, 9)).toBeFalse(); });
  it('true when correct >= masteryCorrect and total >= masteryTotal', () => {
    expect(isBossReady(ch, 8, 10)).toBeTrue();
  });
});

describe('getNextChapterId', () => {
  it('returns 2 for chapter 1', () => { expect(getNextChapterId(1)).toBe(2); });
  it('returns 3 for chapter 2', () => { expect(getNextChapterId(2)).toBe(3); });
  it('returns null for last chapter', () => {
    const lastId = CHAPTERS[CHAPTERS.length - 1].id;
    expect(getNextChapterId(lastId)).toBe(null);
  });
});

describe('isLastChapter', () => {
  it('false for chapter 1', () => { expect(isLastChapter(1)).toBeFalse(); });
  it('true for last chapter', () => {
    const lastId = CHAPTERS[CHAPTERS.length - 1].id;
    expect(isLastChapter(lastId)).toBeTrue();
  });
});
```

- [ ] **Step 2: Implement story.js**

```js
// src/game/story.js
import { SKILLS } from '../utils/math.js';

export const CHAPTERS = [
  {
    id: 1,
    title: 'Addition Adventure',
    skill: SKILLS.SINGLE_DIGIT_ADD,
    masteryCorrect: 8,
    masteryTotal: 10,
    bossId: 1,
    intro: "Let's add some numbers!",
  },
  {
    id: 2,
    title: 'Double Trouble',
    skill: SKILLS.DOUBLE_DIGIT_ADD,
    masteryCorrect: 8,
    masteryTotal: 10,
    bossId: 2,
    intro: 'Now let\'s try bigger numbers!',
  },
  {
    id: 3,
    title: 'Subtraction Station',
    skill: SKILLS.SINGLE_DIGIT_SUB,
    masteryCorrect: 8,
    masteryTotal: 10,
    bossId: 3,
    intro: 'Time to take away!',
  },
  {
    id: 4,
    title: 'Ultimate Challenge',
    skill: SKILLS.DOUBLE_DIGIT_SUB,
    masteryCorrect: 8,
    masteryTotal: 10,
    bossId: 4,
    intro: 'The final challenge awaits!',
  },
];

export function getChapter(id) {
  return CHAPTERS.find(c => c.id === id) ?? null;
}

export function checkMastery(chapter, correct, total) {
  return total >= chapter.masteryTotal && correct >= chapter.masteryCorrect;
}

export function isBossReady(chapter, correct, total) {
  return total >= chapter.masteryTotal && correct >= chapter.masteryCorrect;
}

export function getNextChapterId(currentId) {
  const idx = CHAPTERS.findIndex(c => c.id === currentId);
  if (idx === -1 || idx === CHAPTERS.length - 1) return null;
  return CHAPTERS[idx + 1].id;
}

export function isLastChapter(id) {
  return CHAPTERS[CHAPTERS.length - 1].id === id;
}
```

- [ ] **Step 3: Commit**
```bash
git add src/game/story.js tests/story.test.js
git commit -m "feat: story mode chapter logic with TDD"
```

---

## Task 5: Arcade Logic (TDD)

**Files:**
- Create: `src/game/arcade.js`
- Create: `tests/arcade.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/arcade.test.js
import { describe, it, expect } from './harness.js';
import { getSkillForDifficulty, calcScoreGain, calcNewDifficulty, getDifficultyLabel } from '../src/game/arcade.js';

describe('getSkillForDifficulty', () => {
  it('returns a string for difficulty 1', () => {
    expect(typeof getSkillForDifficulty(1)).toBe('string');
  });
  it('difficulty 1 only returns single-digit-addition', () => {
    for (let i = 0; i < 30; i++)
      expect(getSkillForDifficulty(1)).toBe('single-digit-addition');
  });
  it('clamps below 1 to 1', () => {
    expect(getSkillForDifficulty(0)).toBe('single-digit-addition');
  });
  it('returns a valid skill for difficulty 5', () => {
    const valid = ['double-digit-addition', 'double-digit-subtraction'];
    for (let i = 0; i < 20; i++)
      expect(valid.includes(getSkillForDifficulty(5))).toBeTrue();
  });
});

describe('calcScoreGain', () => {
  it('base: 10 × difficulty at streak < 3', () => {
    expect(calcScoreGain(0, 1)).toBe(10);
    expect(calcScoreGain(2, 2)).toBe(20);
  });
  it('1.5x multiplier at streak 3', () => { expect(calcScoreGain(3, 1)).toBe(15); });
  it('2x multiplier at streak 5', () => { expect(calcScoreGain(5, 1)).toBe(20); });
  it('3x multiplier at streak 10', () => { expect(calcScoreGain(10, 1)).toBe(30); });
  it('scales with difficulty', () => { expect(calcScoreGain(0, 3)).toBe(30); });
});

describe('calcNewDifficulty', () => {
  it('returns 1 for score 0', () => { expect(calcNewDifficulty(0)).toBe(1); });
  it('returns 2 for score 50', () => { expect(calcNewDifficulty(50)).toBe(2); });
  it('returns 3 for score 150', () => { expect(calcNewDifficulty(150)).toBe(3); });
  it('returns 4 for score 300', () => { expect(calcNewDifficulty(300)).toBe(4); });
  it('returns 5 for score 500', () => { expect(calcNewDifficulty(500)).toBe(5); });
});

describe('getDifficultyLabel', () => {
  it('Beginner for 1', () => { expect(getDifficultyLabel(1)).toBe('Beginner'); });
  it('Expert for 5', () => { expect(getDifficultyLabel(5)).toBe('Expert'); });
});
```

- [ ] **Step 2: Implement arcade.js**

```js
// src/game/arcade.js
import { SKILLS } from '../utils/math.js';

const SKILL_POOLS = {
  1: [SKILLS.SINGLE_DIGIT_ADD],
  2: [SKILLS.SINGLE_DIGIT_ADD, SKILLS.SINGLE_DIGIT_SUB],
  3: [SKILLS.SINGLE_DIGIT_ADD, SKILLS.SINGLE_DIGIT_SUB, SKILLS.DOUBLE_DIGIT_ADD],
  4: [SKILLS.DOUBLE_DIGIT_ADD, SKILLS.SINGLE_DIGIT_SUB, SKILLS.DOUBLE_DIGIT_SUB],
  5: [SKILLS.DOUBLE_DIGIT_ADD, SKILLS.DOUBLE_DIGIT_SUB],
};

// Score thresholds that unlock each difficulty level
const THRESHOLDS = [0, 50, 150, 300, 500];

export function getSkillForDifficulty(difficulty) {
  const d = Math.max(1, Math.min(5, difficulty));
  const pool = SKILL_POOLS[d];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function calcScoreGain(streak, difficulty) {
  const mult = streak >= 10 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
  return Math.round(10 * difficulty * mult);
}

export function calcNewDifficulty(score) {
  for (let d = THRESHOLDS.length - 1; d >= 1; d--) {
    if (score >= THRESHOLDS[d]) return d + 1;
  }
  return 1;
}

export function getDifficultyLabel(difficulty) {
  return ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'][difficulty] ?? 'Beginner';
}
```

- [ ] **Step 3: Commit**
```bash
git add src/game/arcade.js tests/arcade.test.js
git commit -m "feat: arcade mode logic with TDD (difficulty scaling, score)"
```

---

## Task 6: Boss System (TDD)

**Files:**
- Create: `src/bosses/bosses.js`
- Create: `src/bosses/bossRunner.js`
- Create: `tests/boss.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/boss.test.js
import { describe, it, expect } from './harness.js';
import { BOSSES, getBoss } from '../src/bosses/bosses.js';
import { createBossSession, recordBossAnswer, tickBossTimer } from '../src/bosses/bossRunner.js';

describe('getBoss', () => {
  it('returns boss 1', () => { expect(getBoss(1).id).toBe(1); });
  it('returns null for unknown id', () => { expect(getBoss(99)).toBe(null); });
  it('all bosses have required fields', () => {
    BOSSES.forEach(b => {
      expect(typeof b.name).toBe('string');
      expect(typeof b.skill).toBe('string');
      expect(typeof b.timeLimit).toBe('number');
      expect(typeof b.questionCount).toBe('number');
    });
  });
});

describe('createBossSession', () => {
  it('starts with 0 answered', () => {
    const s = createBossSession(getBoss(1));
    expect(s.questionsAnswered).toBe(0);
  });
  it('starts with timeRemaining = boss.timeLimit', () => {
    const boss = getBoss(1);
    const s = createBossSession(boss);
    expect(s.timeRemaining).toBe(boss.timeLimit);
  });
  it('starts not finished', () => {
    const s = createBossSession(getBoss(1));
    expect(s.finished).toBeFalse();
  });
});

describe('recordBossAnswer', () => {
  it('increments questionsAnswered', () => {
    const s = createBossSession(getBoss(1));
    recordBossAnswer(s, true);
    expect(s.questionsAnswered).toBe(1);
  });
  it('increments questionsCorrect on correct', () => {
    const s = createBossSession(getBoss(1));
    recordBossAnswer(s, true);
    expect(s.questionsCorrect).toBe(1);
  });
  it('does not increment questionsCorrect on wrong', () => {
    const s = createBossSession(getBoss(1));
    recordBossAnswer(s, false);
    expect(s.questionsCorrect).toBe(0);
  });
  it('sets finished when questionCount reached', () => {
    const boss = getBoss(1); // questionCount: 10
    const s = createBossSession(boss);
    for (let i = 0; i < boss.questionCount; i++) recordBossAnswer(s, true);
    expect(s.finished).toBeTrue();
  });
  it('victory true when >= 70% correct', () => {
    const boss = getBoss(1); // questionCount: 10, need 7
    const s = createBossSession(boss);
    for (let i = 0; i < 7; i++) recordBossAnswer(s, true);
    for (let i = 0; i < 3; i++) recordBossAnswer(s, false);
    expect(s.victory).toBeTrue();
  });
  it('victory false when < 70% correct', () => {
    const boss = getBoss(1);
    const s = createBossSession(boss);
    for (let i = 0; i < 6; i++) recordBossAnswer(s, true);
    for (let i = 0; i < 4; i++) recordBossAnswer(s, false);
    expect(s.victory).toBeFalse();
  });
});

describe('tickBossTimer', () => {
  it('decrements timeRemaining', () => {
    const s = createBossSession(getBoss(1));
    tickBossTimer(s);
    expect(s.timeRemaining).toBe(getBoss(1).timeLimit - 1);
  });
  it('sets finished when time reaches 0', () => {
    const boss = getBoss(1);
    const s = createBossSession(boss);
    s.timeRemaining = 1;
    tickBossTimer(s);
    expect(s.finished).toBeTrue();
    expect(s.timeRemaining).toBe(0);
  });
});
```

- [ ] **Step 2: Implement bosses.js**

```js
// src/bosses/bosses.js
import { SKILLS } from '../utils/math.js';

export const BOSSES = [
  {
    id: 1,
    name: 'Count Confusion',
    emoji: '🧟',
    description: 'Answer 10 questions in 30 seconds!',
    type: 'timed',
    skill: SKILLS.SINGLE_DIGIT_ADD,
    timeLimit: 30,
    questionCount: 10,
    victoryMessage: 'You defeated Count Confusion! 🎉',
  },
  {
    id: 2,
    name: 'The Mega Muncher',
    emoji: '👾',
    description: 'Answer 8 double-digit questions in 40 seconds!',
    type: 'timed',
    skill: SKILLS.DOUBLE_DIGIT_ADD,
    timeLimit: 40,
    questionCount: 8,
    victoryMessage: 'The Mega Muncher is defeated! 🚀',
  },
  {
    id: 3,
    name: 'Subtractor Rex',
    emoji: '🦖',
    description: 'Answer 10 subtraction questions in 35 seconds!',
    type: 'timed',
    skill: SKILLS.SINGLE_DIGIT_SUB,
    timeLimit: 35,
    questionCount: 10,
    victoryMessage: 'Subtractor Rex is no more! 🌟',
  },
  {
    id: 4,
    name: 'The Grand Calculator',
    emoji: '🤖',
    description: 'The ultimate boss! 10 mixed questions in 45 seconds!',
    type: 'timed',
    skill: SKILLS.DOUBLE_DIGIT_SUB,
    timeLimit: 45,
    questionCount: 10,
    victoryMessage: 'You are a Math Champion! 🏆',
  },
];

export function getBoss(id) {
  return BOSSES.find(b => b.id === id) ?? null;
}
```

- [ ] **Step 3: Implement bossRunner.js**

```js
// src/bosses/bossRunner.js
import { generateQuestion } from '../utils/math.js';

export function createBossSession(boss) {
  return {
    boss,
    questionsAnswered: 0,
    questionsCorrect: 0,
    timeRemaining: boss.timeLimit,
    finished: false,
    victory: false,
  };
}

export function getBossQuestion(session) {
  return generateQuestion(session.boss.skill);
}

export function recordBossAnswer(session, correct) {
  session.questionsAnswered += 1;
  if (correct) session.questionsCorrect += 1;
  if (session.questionsAnswered >= session.boss.questionCount) {
    session.finished = true;
    session.victory = session.questionsCorrect >= Math.ceil(session.boss.questionCount * 0.7);
  }
  return session;
}

export function tickBossTimer(session) {
  session.timeRemaining = Math.max(0, session.timeRemaining - 1);
  if (session.timeRemaining === 0) {
    session.finished = true;
    session.victory = session.questionsCorrect >= Math.ceil(session.boss.questionCount * 0.7);
  }
  return session;
}
```

- [ ] **Step 4: Commit**
```bash
git add src/bosses/bosses.js src/bosses/bossRunner.js tests/boss.test.js
git commit -m "feat: boss system with timed battles and TDD"
```

---

## Task 7: Hints Utility

**Files:**
- Create: `src/utils/hints.js`

```js
// src/utils/hints.js
const ADD_HINTS = [
  (a, b) => `Try counting up ${b} from ${a} on your fingers! 🖐`,
  (a, b) => `Think: you have ${a} apples and get ${b} more. How many total?`,
  (a, b) => `Start at ${a} and count: ${Array.from({length:b},(_,i)=>a+i+1).join(', ')}`,
];
const SUB_HINTS = [
  (a, b) => `Start at ${a} and count back ${b} steps on your fingers! 🖐`,
  (a, b) => `If you had ${a} cookies and ate ${b}, how many are left?`,
  (a, b) => `Count back from ${a}: ${Array.from({length:b},(_,i)=>a-i-1).slice(0,6).join(', ')}...`,
];

export function getHint(question) {
  const { operands, operator } = question;
  if (!operands || !operator) return 'Take your time and think carefully! 🧠';
  const [a, b] = operands;
  const pool = operator === '+' ? ADD_HINTS : SUB_HINTS;
  return pool[Math.floor(Math.random() * pool.length)](a, b);
}

export async function getWolframHint(question, appId) {
  if (!appId) return getHint(question);
  try {
    const query = encodeURIComponent(question.question.replace('= ?', '').trim());
    const url = `https://api.wolframalpha.com/v1/result?appid=${appId}&i=${query}`;
    const res = await fetch(url);
    if (!res.ok) return getHint(question);
    const text = await res.text();
    return `The answer is ${text} — but try to figure it out yourself first! 🧠`;
  } catch {
    return getHint(question);
  }
}
```

- [ ] **Step 1: Commit**
```bash
git add src/utils/hints.js
git commit -m "feat: hint system with Wolfram Alpha fallback"
```

---

## Task 8: CSS Styles

**Files:**
- Create: `src/styles/main.css`

```css
/* src/styles/main.css */
:root {
  --primary: #6c63ff;
  --secondary: #ff6584;
  --accent: #43e97b;
  --bg: #1a1a2e;
  --surface: #16213e;
  --surface2: #0f3460;
  --text: #eaeaea;
  --text-dim: #a0a0b0;
  --correct: #43e97b;
  --incorrect: #ff6584;
  --star: #ffd700;
  --radius: 16px;
  --shadow: 0 8px 32px rgba(0,0,0,0.3);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
  overflow-x: hidden;
}
#app {
  width: 100%;
  max-width: 600px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.screen { width: 100%; display: none; flex-direction: column; align-items: center; gap: 16px; }
.screen.active { display: flex; }

/* HUD */
#hud {
  width: 100%;
  display: flex;
  justify-content: space-between;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 10px 20px;
  box-shadow: var(--shadow);
}
.hud-item { display: flex; flex-direction: column; align-items: center; }
.hud-label { font-size: 0.65em; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
.hud-value { font-size: 1.3em; font-weight: bold; }
.hud-score { color: var(--star); }
.hud-streak { color: var(--accent); }
.hud-lives { color: var(--secondary); letter-spacing: 2px; }

/* Title */
.game-title {
  font-size: 2.8em;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  animation: pulse 2.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 14px 28px; border: none; border-radius: var(--radius);
  font-family: inherit; font-size: 1.15em; font-weight: 700;
  cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
  min-height: 64px; box-shadow: var(--shadow);
  user-select: none; -webkit-tap-highlight-color: transparent;
}
.btn:active { transform: scale(0.95); }
.btn-primary { background: linear-gradient(135deg, var(--primary), #8b7fff); color: #fff; }
.btn-secondary { background: linear-gradient(135deg, var(--secondary), #ff8fab); color: #fff; }
.btn-accent { background: linear-gradient(135deg, var(--accent), #38f9d7); color: #1a1a2e; }
.btn-answer {
  background: var(--surface2); color: var(--text);
  border: 3px solid transparent; font-size: 1.5em;
  width: calc(50% - 6px); aspect-ratio: 2/1;
  transition: all 0.15s;
}
.btn-answer:hover:not(:disabled) { border-color: var(--primary); background: var(--surface); }
.btn-answer.correct  { background: var(--correct); color: #1a1a2e; border-color: var(--correct); animation: pop 0.4s; }
.btn-answer.incorrect { background: var(--incorrect); color: #fff; border-color: var(--incorrect); animation: shake 0.4s; }
.btn-answer:disabled { opacity: 0.7; cursor: default; }
@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }

/* Question */
.question-card {
  width: 100%; background: var(--surface);
  border-radius: var(--radius); padding: 28px 20px;
  text-align: center; box-shadow: var(--shadow);
  border: 2px solid var(--surface2);
}
.question-text { font-size: 2.8em; font-weight: 900; letter-spacing: 2px; margin-bottom: 8px; }
.question-hint { font-size: 0.9em; color: var(--text-dim); min-height: 22px; }
.answer-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; width: 100%; }

/* Menu */
.menu-buttons { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 280px; }

/* Story map */
.chapter-list { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.chapter-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--surface); border-radius: var(--radius);
  padding: 14px 18px; cursor: pointer;
  border: 2px solid transparent; transition: border-color 0.2s, transform 0.1s;
  box-shadow: var(--shadow);
}
.chapter-card:hover:not(.locked) { border-color: var(--primary); transform: translateX(4px); }
.chapter-card.locked { opacity: 0.45; cursor: not-allowed; }
.chapter-card.completed { border-color: var(--accent); }
.chapter-icon { font-size: 1.8em; }
.chapter-info { flex: 1; }
.chapter-title { font-size: 1em; font-weight: 700; }
.chapter-subtitle { font-size: 0.78em; color: var(--text-dim); }

/* Boss */
.boss-card {
  width: 100%;
  background: linear-gradient(135deg, #2d0038, #0f0030);
  border: 3px solid var(--secondary); border-radius: var(--radius);
  padding: 20px; text-align: center;
  box-shadow: 0 0 40px rgba(255,101,132,0.25);
}
.boss-emoji { font-size: 4.5em; display: block; animation: bossBounce 1s ease-in-out infinite; }
@keyframes bossBounce { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-10px) rotate(5deg)} }
.boss-name { font-size: 1.6em; font-weight: 900; color: var(--secondary); margin: 6px 0; }
.boss-desc { color: var(--text-dim); font-size: 0.9em; }
.boss-timer { font-size: 2.4em; font-weight: 900; color: var(--star); text-align: center; }
.boss-timer.urgent { color: var(--incorrect); animation: timerPulse 0.5s ease-in-out infinite; }
@keyframes timerPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
.boss-progress { color: var(--text-dim); font-size: 0.88em; text-align: center; margin-top: 4px; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 100;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal {
  background: var(--surface); border-radius: var(--radius);
  padding: 28px 22px; max-width: 380px; width: 90%; text-align: center;
  box-shadow: 0 20px 80px rgba(0,0,0,0.5);
  animation: modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes modalPop { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
.modal-icon { font-size: 3.5em; margin-bottom: 10px; }
.modal-title { font-size: 1.7em; font-weight: 900; margin-bottom: 8px; }
.modal-body { color: var(--text-dim); margin-bottom: 18px; line-height: 1.5; }
.modal-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

/* Feedback float */
.feedback-overlay {
  position: fixed; inset: 0; pointer-events: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 4em; z-index: 50; opacity: 0;
}
.feedback-overlay.show { animation: feedbackFloat 0.7s forwards; }
@keyframes feedbackFloat {
  0%   { transform: scale(0.5) translateY(0); opacity: 1; }
  100% { transform: scale(1.8) translateY(-80px); opacity: 0; }
}

/* Misc */
.mode-label { color: var(--text-dim); font-size: 0.85em; }
@media (max-width: 400px) {
  .game-title { font-size: 2em; }
  .question-text { font-size: 2.2em; }
  .btn-answer { font-size: 1.2em; }
}
```

- [ ] **Step 1: Commit**
```bash
git add src/styles/main.css
git commit -m "feat: full CSS design system — kid-friendly, animated, responsive"
```

---

## Task 9: UI Components

**Files:**
- Create: `src/components/button.js`
- Create: `src/components/modal.js`
- Create: `src/components/scoreDisplay.js`

```js
// src/components/button.js
export function createButton({ text, variant = 'primary', onClick, icon = '' }) {
  const btn = document.createElement('button');
  btn.className = `btn btn-${variant}`;
  btn.innerHTML = icon ? `${icon} ${text}` : text;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}
```

```js
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
```

```js
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
```

- [ ] **Step 1: Commit**
```bash
git add src/components/button.js src/components/modal.js src/components/scoreDisplay.js
git commit -m "feat: UI components — button, modal, HUD scoreDisplay"
```

---

## Task 10: index.html

**Files:**
- Create: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MathQuest 🌟</title>
  <link rel="stylesheet" href="src/styles/main.css">
</head>
<body>
  <div id="app">
    <!-- HUD (shown during gameplay) -->
    <div id="hud" style="display:none">
      <div class="hud-item">
        <span class="hud-label">Score</span>
        <span class="hud-value hud-score" id="hud-score">0</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Streak</span>
        <span class="hud-value hud-streak" id="hud-streak">—</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Lives</span>
        <span class="hud-value hud-lives" id="hud-lives">∞</span>
      </div>
    </div>

    <!-- MENU -->
    <div id="screen-menu" class="screen active">
      <h1 class="game-title">MathQuest 🌟</h1>
      <p style="color:var(--text-dim);text-align:center">Fun math for every age!</p>
      <div class="menu-buttons">
        <button class="btn btn-primary"   id="btn-story">📖 Story Mode</button>
        <button class="btn btn-secondary" id="btn-arcade">🎮 Arcade Mode</button>
        <button class="btn btn-accent"    id="btn-highscore-display">🏆 Best: <span id="menu-highscore">0</span></button>
      </div>
    </div>

    <!-- STORY MAP -->
    <div id="screen-story" class="screen">
      <h2 style="color:var(--primary)">📖 Story Mode</h2>
      <div class="chapter-list" id="chapter-list"></div>
      <button class="btn btn-secondary" id="btn-story-back">← Back</button>
    </div>

    <!-- GAME (arcade + story practice) -->
    <div id="screen-game" class="screen">
      <div class="mode-label" id="mode-label"></div>
      <div class="question-card">
        <div class="question-text" id="question-text"></div>
        <div class="question-hint" id="question-hint"></div>
      </div>
      <div class="answer-grid" id="answer-grid"></div>
      <div id="hint-btn-wrap"></div>
      <button class="btn btn-secondary" id="btn-game-back"
              style="font-size:0.82em;padding:10px 20px;min-height:44px">🏠 Menu</button>
    </div>

    <!-- BOSS -->
    <div id="screen-boss" class="screen">
      <div class="boss-card">
        <span class="boss-emoji" id="boss-emoji"></span>
        <div class="boss-name" id="boss-name"></div>
        <div class="boss-desc" id="boss-desc"></div>
      </div>
      <div class="boss-timer"   id="boss-timer"></div>
      <div class="boss-progress" id="boss-progress"></div>
      <div class="question-card">
        <div class="question-text" id="boss-question"></div>
      </div>
      <div class="answer-grid" id="boss-answer-grid"></div>
    </div>
  </div>

  <!-- Floating emoji feedback -->
  <div class="feedback-overlay" id="feedback-overlay"></div>

  <script type="module" src="main.js"></script>
</body>
</html>
```

- [ ] **Step 1: Commit**
```bash
git add index.html
git commit -m "feat: index.html with all screen markup"
```

---

## Task 11: main.js — Game Bootstrap & Loop

**Files:**
- Create: `main.js`

```js
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
  void el.offsetWidth; // reflow
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
```

- [ ] **Step 1: Commit**
```bash
git add main.js
git commit -m "feat: main game bootstrap, arcade loop, story loop, boss battle"
```

---

## Task 12: Final Push to GitHub

- [ ] **Step 1: Push all commits**
```bash
git push origin master
```

---

## Verification

Open `tests/runner.html` in any modern browser (Chrome/Firefox/Edge). All tests should show ✅. Expected output:

```
✅ returns question/answer/operands/operator fields
✅ answer equals sum of operands
✅ operands are 1–9
... (all tests green)
N / N tests passed
```

Open `index.html` to play the game. Verify:
1. Menu loads with Story and Arcade buttons
2. Arcade starts, questions appear, score/streak update
3. Difficulty label changes as score increases
4. Story Chapter 1 starts, questions count down to boss
5. Boss fight timer ticks, questions answer, victory/defeat modal shows
6. Winning boss unlocks Chapter 2 in story map
7. Progress persists after page refresh
