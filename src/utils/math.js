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
    const candidate = answer + randInt(-10, 10);
    if (candidate !== answer && candidate >= 0) choices.add(candidate);
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
