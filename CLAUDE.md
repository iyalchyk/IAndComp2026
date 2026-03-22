# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"MeAndComp" (Я и Компьютер) — a browser-based remake of the classic Russian game "I and Computer." The player manages money, mood, satiety, housing, education, jobs, hardware, software, and entertainment in a Windows 98-themed UI (using the 98.css library). The game UI is entirely in Russian.

## Build & Development

- **Dev server (build + watch + live reload):** `npm start` (runs `gulp` default task)
- **Production build only:** `npm run build` (runs `gulp build`)
- Both tasks clean `dist/`, then compile HTML, copy CSS/JS/assets to `dist/`. The dev task additionally starts BrowserSync with file watching.
- **No test framework or linter is configured.**

## Architecture

### Build Pipeline (gulpfile.js)
Gulp 4 pipeline: Nunjucks templates → beautified HTML, plus straight copies of CSS, JS, and assets into `dist/`.

### Source Layout
- `src/html/pages/index.njk` — single-page Nunjucks template that includes all panel partials
- `src/html/partials/*.html` — HTML fragments for each game panel
- `src/js/main.js` — entry point (ES module); imports all panel setup functions, loads game data from JSON, runs the game loop via `setInterval`
- `src/js/global.js` — defines the three global singletons: `World` (game data/config), `Player` (player state), `Interface` (UI update methods)
- `src/js/data.js` — fetches `assets/data/world.json` at startup and merges it into `World`; also links shop items into doubly-linked lists (prev/next)
- `src/js/partials/<panel>.js` — each panel JS file attaches its own properties to `Player.<module>` and `Interface.<module>`, then exports a `<panel>_setup()` function and optionally an `update_<panel>_state()` tick function
- `src/css/main.css` — all custom styles; layout uses absolute positioning within a fixed-size 693×515 window
- `assets/data/world.json` — all game configuration data (items, prices, constants, text)

### Key Patterns
- **Global singletons pattern:** `World`, `Player`, and `Interface` (from `global.js`) are extended by each panel module at import time. Panel modules attach their state/methods directly (e.g., `Player.housing = {...}`, `Interface.housing = {...}`).
- **Game tick:** `main.js` calls `next_hour_handler()` on an interval (`World.constants.TIME_QUANT`). Each tick updates time, status (money/mood/satiety deductions), education progress, and bank interest.
- **Panel navigation:** Panels are shown/hidden via jQuery `.show()`/`.hide()` on `.switchable` elements. The "home" button returns to the status panel.
- **Item progression:** Shop items (housing, hardware, etc.) form linked lists. Players buy the "next" item in a category; buttons disable when the chain ends.
- **Requirement checking:** `Player.check_requirement()` iterates all modules' `get_attributes()` to verify prerequisites for jobs, education, etc.
- **No bundler:** JS files are copied as-is to `dist/` and loaded as ES modules in the browser. jQuery is loaded from CDN.