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
    description: 'The ultimate boss! 10 big subtraction questions in 45 seconds!',
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
