// src/utils/hints.js
const ADD_HINTS = [
  (a, b) => `Try counting up ${b} from ${a} on your fingers! 🖐`,
  (a, b) => `Think: you have ${a} apples and get ${b} more. How many total?`,
  (a, b) => `Start at ${a} and count: ${Array.from({length:b},(_,i)=>a+i+1).join(', ')}`,
];
const SUB_HINTS = [
  (a, b) => `Start at ${a} and count back ${b} steps on your fingers! 🖐`,
  (a, b) => `If you had ${a} cookies and ate ${b}, how many are left?`,
  (a, b) => `Count back from ${a}: ${Array.from({length:b},(_,i)=>a-i-1).slice(0,6).join(', ')}...`,
];

export function getHint(question) {
  const { operands, operator } = question;
  if (!operands || !operator) return 'Take your time and think carefully! 🧠';
  const [a, b] = operands;
  const pool = operator === '+' ? ADD_HINTS : SUB_HINTS;
  return pool[Math.floor(Math.random() * pool.length)](a, b);
}

export async function getWolframHint(question, appId) {
  if (!appId) return getHint(question);
  try {
    const query = encodeURIComponent(question.question.replace('= ?', '').trim());
    const url = `https://api.wolframalpha.com/v1/result?appid=${appId}&i=${query}`;
    const res = await fetch(url);
    if (!res.ok) return getHint(question);
    const text = await res.text();
    return `The answer is ${text} — but try to figure it out yourself first! 🧠`;
  } catch {
    return getHint(question);
  }
}
