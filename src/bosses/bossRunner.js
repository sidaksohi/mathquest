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
