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
