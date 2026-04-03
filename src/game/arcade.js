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
  const d = Math.max(1, Math.min(5, difficulty));
  return ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'][d - 1];
}
