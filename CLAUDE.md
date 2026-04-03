# MathQuest — AI Math Game

## Project Overview

MathQuest is a fun, gamified math game for Kindergarten–2nd grade students (ages 5–7). It runs entirely in the browser with no build tools, no frameworks, and no dependencies — just HTML, CSS, and vanilla JavaScript.

## Target Audience

Children aged 5–7 (K–2nd grade). All UX decisions must prioritize:
- Large, tappable buttons (min 64px)
- Bright, encouraging colors
- Friendly language — no negative reinforcement
- Sound feedback (correct/incorrect/boss-defeated)
- Short sessions with clear progress indicators

## Architecture

```
mathquest/
├── index.html          # Entry point — loads all modules
├── main.js             # Bootstrap: initializes state and mounts views
├── tests/
│   └── runner.html     # In-browser test harness
├── src/
│   ├── styles/
│   │   └── main.css    # Global styles, animations, theme variables
│   ├── utils/
│   │   ├── math.js     # Question generation, answer validation
│   │   └── hints.js    # Hint system (hardcoded + optional Wolfram Alpha)
│   ├── components/
│   │   ├── button.js   # Reusable button factory
│   │   ├── modal.js    # Reusable modal (boss intro, level up, game over)
│   │   └── scoreDisplay.js  # Score, streak, lives HUD
│   ├── game/
│   │   ├── state.js    # Centralized game state object
│   │   ├── arcade.js   # Arcade mode loop (endless, scaling difficulty)
│   │   └── story.js    # Story mode progression (chapters → bosses)
│   └── bosses/
│       ├── bossRunner.js    # Boss challenge orchestration
│       └── bosses.js        # Boss definitions (timed, multi-step, etc.)
```

## Game Modes

### Arcade Mode
- Random questions from the active difficulty pool
- Points accumulate; difficulty scales every N correct answers
- Streak bonus multipliers (3x, 5x, 10x streak = bonus points)
- No lives — play forever; game tracks high score

### Story Mode
Chapters unlock sequentially. Each chapter = one skill. Mastery = 8/10 correct.

| Chapter | Skill                  | Boss Challenge            |
|---------|------------------------|---------------------------|
| 1       | Single-digit addition  | Timed blitz (10 Qs, 30s)  |
| 2       | Double-digit addition  | Multi-step combo           |
| 3       | Single-digit subtraction | Timed blitz               |
| 4       | Double-digit subtraction | Boss gauntlet (mixed)     |

## State Shape

```js
{
  mode: 'menu' | 'arcade' | 'story',
  score: 0,
  streak: 0,
  highScore: 0,
  difficulty: 1,          // 1–5 scale
  currentQuestion: null,
  story: {
    chapter: 1,
    chapterCorrect: 0,
    chapterTotal: 0,
    unlockedChapters: [1],
    bossActive: false,
  },
  boss: null,             // active boss definition or null
  lives: 3,              // story mode only
}
```

State is persisted to `localStorage` so progress survives page refresh.

## TDD Rules

**All core logic must be test-first (Red → Green → Refactor).**

Covered by tests:
- `math.js`: question generation, answer validation, difficulty scaling
- `state.js`: state transitions, score/streak updates
- `story.js`: chapter progression, mastery check, boss unlock logic
- `arcade.js`: difficulty ramp, score calculation

Tests run in `tests/runner.html`. Open in browser; results appear in the console and in a visual pass/fail list on screen.

## Development Workflow

1. Write a failing test in `tests/`
2. Implement minimal code to pass
3. Refactor for clarity
4. Open `tests/runner.html` to verify

## Coding Standards

- **No frameworks, no npm, no build step** — plain ES modules via `<script type="module">`
- Functions must be pure where possible (especially in `utils/`)
- State mutations only in `state.js`
- No inline styles — all styling via CSS classes/variables
- Comments only where the *why* is not obvious from the code
- Max file length: ~200 lines; split if larger

## Extending the Game

To add a new math skill:
1. Add question generator to `src/utils/math.js`
2. Add a new chapter entry in `src/game/story.js`
3. Add a boss definition in `src/bosses/bosses.js`
4. Write tests for the new generator in `tests/`

## Optional: Wolfram Alpha API

Set `window.WOLFRAM_APP_ID = 'YOUR_KEY'` before loading `main.js` (e.g., in a `config.js`).
The hints system falls back gracefully to hardcoded hints when the key is absent.

## Running the Project

```
Open index.html in any modern browser.
No server required.
```

For tests:
```
Open tests/runner.html in any modern browser.
```
