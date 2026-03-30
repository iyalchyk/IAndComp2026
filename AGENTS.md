# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

"MeAndComp" (Я и Компьютер) — a browser-based remake of the classic Russian game "I and Computer" (version 2.2, by Леушев Юрий / GiNeag). The player manages money, mood, satiety, housing, education, jobs, hardware, software, and entertainment in a Windows 98-themed UI (using the 98.css library). The game UI is entirely in Russian.

## Build & Development

- **Dev server (build + watch + live reload):** `npm start` (runs `gulp` default task)
- **Production build only:** `npm run build` (runs `gulp build`)
- Both tasks clean `dist/`, then compile HTML, copy CSS/JS/assets to `dist/`. The dev task additionally starts BrowserSync with file watching.
- **No test framework or linter is configured.**

## Architecture

### Build Pipeline (gulpfile.js)
Gulp 5 pipeline: Nunjucks templates → beautified HTML, plus straight copies of CSS, JS, and assets into `dist/`.

### Source Layout
- `src/html/pages/index.njk` — single-page Nunjucks template that includes all panel partials
- `src/html/partials/*.html` — HTML fragments for each game panel (status, housing, shop, entertainment, hobby, education, job, bank, hardware, software, buttons)
- `src/js/main.js` — entry point (ES module); imports all panel setup functions, loads game data from JSON, runs the game loop via `setInterval`
- `src/js/global.js` — defines the three global singletons: `World` (game data/config), `Player` (player state), `Interface` (UI update methods)
- `src/js/data.js` — fetches `assets/data/world.json` at startup and merges it into `World`; also links shop items into doubly-linked lists (prev/next)
- `src/js/partials/<panel>.js` — each panel JS file attaches its own properties to `Player.<module>` and `Interface.<module>`, then exports a `<panel>_setup()` function and optionally an `update_<panel>_state()` tick function
- `src/css/main.css` — imports all partial CSS files via `@import`
- `src/css/partials/*.css` — split styles: `base.css` (core layout, 693×515 window), plus per-panel CSS files (status, housing, buttons, entertainment, software)
- `assets/data/world.json` — all game configuration data (items, prices, constants, text)
- `assets/data/classic_style.md` — design reference doc with original game specs and Russian UI text for unimplemented features
- `assets/images/` — Win98 theme backgrounds, housing SVGs (apartments, furniture, kitchen, bathroom), fishing game sprites
- `assets/screenshots/` — screenshots of the original game for reference

### Game Modules
There are 12 panel modules in `src/js/partials/`:
| Module | Player state | Tick update | Notes |
|--------|-------------|-------------|-------|
| `time_panel` | `Player.time` (cur_time) | `update_time_state` | Increments hours, detects new day |
| `status_panel` | `Player.status` (money, mood, satiety) | `update_status_state` | Deducts mood/satiety every 12h, adds salary every 24h. Initial: money=16000, mood=30, satiety=30 |
| `housing_panel` | `Player.housing` (apartment, furniture, kitchen, bathroom) | — | Linked-list progression for each property type |
| `shop_panel` | `Player.shop` (clothes, car) | — | Food (breakfast/lunch/dinner) is one-time buy; clothes & car are progressions |
| `entertainment_panel` | `Player.entertainment` | — | 5 types: party, disco + 3 mini-games (roulette, slot machine, arcanoid) |
| `hobby_panel` | `Player.hobby` (fish, groundbait, fishing_rod, fishing_tackle) | — | Fishing mini-game: 30s timed, click fish as they spawn |
| `education_panel` | `Player.education` (school, english_course, computer_course) | `update_education_state` | Experience/level progression, max 3 levels per course |
| `job_panel` | `Player.job` (id, salary) | — | 10 jobs from porter to computer_president, each with requirements |
| `bank_panel` | `Player.bank` (deposit) | `update_bank_state` | 5% daily interest on deposit (deposit/20 per day) |
| `hardware_panel` | `Player.hardware` (CPU, monitor, printer, etc.) | — | 10 component types, each a linked-list progression |
| `software_panel` | `Player.software` (OS, compiler, graphics, etc.) | — | 7 categories with version progressions; require hardware prerequisites |
| `buttons_panel` | — | — | Navigation: toggles `.switchable` panel visibility |

### Key Patterns
- **Global singletons pattern:** `World`, `Player`, and `Interface` (from `global.js`) are extended by each panel module at import time. Panel modules attach their state/methods directly (e.g., `Player.housing = {...}`, `Interface.housing = {...}`).
- **Game tick:** `main.js` calls `next_hour_handler()` on an interval (`World.constants.TIME_QUANT` = 500ms). Each tick updates: time → status → education → bank.
- **Panel navigation:** Panels are shown/hidden via jQuery `.show()`/`.hide()` on `.switchable` elements. Button `name` attributes map to target panel IDs. The "home" button returns to the status panel.
- **Item progression:** Shop items (housing, hardware, software, clothes, car) form doubly-linked lists (prev/next pointers created in `data.js`). Players buy the "next" item; buttons disable when the chain ends.
- **Requirement checking:** `Player.check_requirement()` iterates all modules' `get_attributes()` to verify prerequisites for jobs, software, etc.
- **Mini-games:** Entertainment and hobby panels embed interactive mini-games (roulette, slot machine, arcanoid/breakout, fishing) using timer-based animations and HTML5 Canvas (arcanoid). Each mini-game runs in a modal popup div.
- **Cached jQuery selectors:** Entertainment and hobby panels cache frequently-used jQuery selectors in module-level variables to avoid repeated DOM queries.
- **No bundler:** JS files are copied as-is to `dist/` and loaded as ES modules in the browser. jQuery is loaded from CDN.