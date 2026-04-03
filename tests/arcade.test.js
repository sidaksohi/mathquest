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
