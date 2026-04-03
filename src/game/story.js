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
    intro: "Now let's try bigger numbers!",
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
