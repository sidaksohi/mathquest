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
