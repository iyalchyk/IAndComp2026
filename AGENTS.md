# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working in this repository.

## Project Overview

"MeAndComp" ("Я и Компьютер") is a browser remake of the classic Russian game "I and Computer 2.2" by Леушев Юрий / GiNeag.

- The app is a single-page Windows 98-styled game built from static HTML, CSS, and ES modules.
- The UI text is Russian. Preserve existing Russian copy unless the user explicitly asks to rewrite or translate it.
- The source of truth is `src/` plus `assets/`. `dist/` is generated output, although it is currently checked into the repo.

## Build & Development

- Dev server: `npm start`
- Production build: `npm run build`
- Both commands run the Gulp pipeline: clean `dist/` -> render HTML -> copy CSS -> copy JS -> copy assets.
- The dev command also starts BrowserSync and watches `src/**/*`.
- There is no configured test framework or linter.

Important runtime note:

- The app relies on `$.getJSON(...)`, `fetch(...)`, and ES module loading. Do not validate it by opening `dist/index.html` directly via `file://`; serve it through `npm start` or another HTTP server.

## Build Pipeline

`gulpfile.js` is intentionally simple:

- Renders `src/html/pages/*.+(html|njk)` with `gulp-nunjucks-render`
- Beautifies the generated HTML
- Copies `src/css/**` to `dist/css`
- Copies `src/js/**` to `dist/js`
- Copies `assets/**` to `dist/assets`
- Uses BrowserSync to serve `dist/`

There is no bundling, transpilation, tree-shaking, minification, or asset fingerprinting. Browser code is shipped nearly as written.

## Source Layout

- `src/html/pages/index.njk` - the only page; includes all panel partials and global dialogs
- `src/html/partials/*.html` - panel markup and modal/subpanel markup
- `src/js/main.js` - app entrypoint; loads world data, runs setup, starts the game loop
- `src/js/global.js` - defines the `World`, `Player`, and `Interface` singletons
- `src/js/data.js` - loads `assets/data/world.json` and links progression arrays into `prev`/`next` chains
- `src/js/partials/*.js` - per-panel modules that attach state and UI methods onto the global singletons
- `src/css/main.css` - imports all CSS partials
- `src/css/partials/*.css` - split per panel plus `base.css`
- `assets/data/world.json` - main gameplay configuration
- `assets/data/internet_computer.txt` - internet panel article text
- `assets/data/internet_anecdotes_01.txt` / `_02.txt` / `_03.txt` - internet anecdote text assets
- `assets/images/` - backgrounds, housing SVGs, hobby assets, shop images, favicon
- `screenshots/` - current UI reference screenshots for implemented panels and flows


## Runtime Architecture

### Global singleton pattern

Every JS partial mutates one or more shared objects from `src/js/global.js`:

- `World` holds loaded config and helper methods
- `Player` holds game state and behavior
- `Interface` holds DOM update and dialog behavior

Panel modules attach themselves at import time. This means setup order matters, and cross-module coupling is high.

### Data loading

`load_assets("assets/data/world.json", init_game)`:

- fetches `world.json`
- copies its sections into `World`
- converts progression arrays to doubly linked lists by assigning `.prev` and `.next`
- only after that calls `init_game()`

That linked-list preprocessing is used by housing, shop, and hardware progression flows.

### Main loop

`main.js` defines `next_hour_handler()` and runs it every `World.constants.TIME_QUANT` milliseconds. The current update order is:

1. `update_time_state()`
2. `update_status_state()`
3. `update_education_state()`
4. `update_bank_state()`
5. `update_internet_state()`
6. `update_taxi_event()`

Startup sequence also matters:

- `time_panel_setup()` already advances time once
- `init_game()` then calls `next_hour_handler()` once before starting `setInterval(...)`

So the game advances immediately during initialization. If you change initial-time logic, check both places.

### Navigation and dialogs

- Panels are shown/hidden with jQuery by toggling `.switchable` sections.
- The status screen is the "home" view; `#home_button` returns there.
- `buttons_panel.js` is the main navigation hub and also owns several cross-cutting flows:
  - about/new game
  - bank taxi gating
  - taxi accident and court event
  - hacking entry requirement check
  - "buy all" cheat button
- Global message dialogs are centralized through `Interface.show_dialog(...)`.

### Status panel as dashboard

`status_panel.html` is not just the player's mood/money view. It is also the live dashboard for:

- current job and salary
- education state
- housing/shop ownership
- hardware
- software
- internet access and anecdote download status

Many modules update labels inside the status panel directly.

## Current Module Inventory

There are 14 JS partial modules in `src/js/partials/`:

| Module | Main state / role | Tick update | Notes |
| --- | --- | --- | --- |
| `time_panel` | `Player.time.cur_time`, `total_hours` | `update_time_state` | Increments hour counter and wraps by `HOURS_IN_DAY` |
| `status_panel` | `Player.status.money`, `mood`, `satiety` | `update_status_state` | Handles money, danger thresholds, and death dialogs |
| `buttons_panel` | navigation and cross-panel events | `update_taxi_event` | Also contains buy-all helper and bank/hacking entry logic |
| `housing_panel` | `Player.housing.apartment`, `furniture`, `kitchen`, `bathroom` | none | Linked-list progression purchases with preview image |
| `shop_panel` | `Player.shop.clothes`, `car` | none | Food purchases are one-off data objects; clothes/car are progressions |
| `entertainment_panel` | leisure + casino UI | none | Party, disco, roulette, slot machine, and arcanoid |
| `hobby_panel` | `Player.hobby.fish`, `groundbait`, `fishing_rod`, `fishing_tackle` | none | Includes separate fishing trip and fishing minigame panel |
| `education_panel` | `school`, `english_course`, `computer_course` | `update_education_state` | Tracks attendance, experience, levels, and completion |
| `job_panel` | `Player.job.id`, `salary` | none | Renders requirement lists; exports `build_requirements_html()` |
| `bank_panel` | `Player.bank.deposit` | `update_bank_state` | Daily interest is `deposit / 20` |
| `hardware_panel` | 10 hardware slots | none | CPU, monitor, printer, scanner, modem, HDD, CDROM, RAM, sound_card, video_card |
| `software_panel` | 7 software categories | none | OS, compiler, graphics, antivirus, browser, dialer, downloader |
| `internet_panel` | connection state, online hours, anecdote download, virus events | `update_internet_state` | Uses local text assets plus timed download/virus flows |
| `hacking_panel` | current task / execution state | none | Requirement-gated task board driven by `World.hacking.tasks` |

Visible UI panels are slightly different from the JS module list:

- `status`, `housing`, `shop`, `entertainment`, `hobby`, `education`, `job`, `bank`, `hardware`, `software`, `internet`, `hacking`
- plus the separate `#fishing_game_panel` subpanel inside the hobby flow

## Data Model

Top-level sections currently present in `assets/data/world.json`:

- `constants`
- `interface`
- `housing`
- `shop`
- `entertainment`
- `hobby`
- `education`
- `job`
- `bank`
- `hardware`
- `software`
- `internet`
- `hacking`

Notable current shapes:

- `housing`, `shop.clothes`, `shop.car`, and `hardware.*` are arrays of progression items
- `software.<category>` is an object map keyed by software id, not an array
- `job` is an object map containing 11 entries, including `unemployed`
- `internet` currently stores only requirements in `world.json`; most internet page content lives in separate text files
- `hacking` stores requirements plus a task list

## Important Implementation Details

### Requirement checking is centralized but limited

`Player.check_requirement()` iterates modules listed by `World.get_modules()` and looks for matching keys in each module's `get_attributes()`.

Current caveats:

- `World.get_modules()` includes `internet` but does not include `hacking`
- the requirement checker assumes matching values expose a `.level` field
- if you add a new requirement key, you usually must update:
  - the owning module's `get_attributes()`
  - `World.get_modules()` if the module is new
  - human-readable requirement titles in `job_panel.js` and/or `software_panel.js`

### Cross-module UI coupling is high

Common examples:

- status labels are updated from multiple other modules
- `buttons_panel.js` opens bank and hacking panels conditionally
- `job_panel.js` exports requirement rendering reused by `internet_panel.js` and `buttons_panel.js`
- `internet_panel.js` depends on `Player.software.antivirus` and internet requirements depend on hardware/software ownership

Renaming DOM ids, data keys, or module attributes usually requires coordinated edits in HTML, CSS, JS, and `world.json`.

### Paths are mostly root-relative in the UI

Several image paths use `/assets/...` rather than `assets/...`. If the app is ever hosted below the domain root, those paths will need attention.

### Cached selectors and timers

The more interactive modules keep state in module-level variables:

- `entertainment_panel.js` caches many jQuery selectors and manages roulette/slot/arcanoid timers
- `hobby_panel.js` manages fishing minigame timers and a separate panel
- `internet_panel.js` caches selectors, memoizes text fetch promises, and manages download/virus timers
- `hacking_panel.js` manages task execution progress with local timer state

When changing those flows, make sure timers and visibility state are cleaned up correctly.

## Working Guidelines For This Repo

- Edit `src/` and `assets/`, not `dist/`, unless the user explicitly asks for generated-output changes.
- Keep the Russian UI text consistent with the existing game tone.
- If you add a new panel or new panel button, update all three layers:
  - HTML partials
  - CSS partial imports/layout
  - `main.js` setup imports and initialization order
- If you add new data-driven progression content, verify that `data.js` preprocessing still matches the shape.
- If you change requirement-bearing content, verify both the actual logic and the human-readable requirement rendering.
- Use `screenshots/` as the current visual reference set for implemented features.

## Practical Validation

Because there are no automated tests, the normal validation path is manual:

1. Run `npm run build` to ensure the static pipeline still completes.
2. Run `npm start` to verify the app through BrowserSync.
3. Check the affected panel flow in the browser, especially if the change touches:
   - navigation/home behavior
   - timers or hourly updates
   - dialogs/modals
   - requirement gating
   - root-relative asset paths
