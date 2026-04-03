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
