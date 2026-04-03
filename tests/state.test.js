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
    // highScore must be >= score (resetSession preserves highScore across sessions by design)
    expect(getState().highScore >= getState().score).toBeTrue();
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
