# Architecture Refactoring Guide for Desktop Todo Widget

A comprehensive analysis of the current architecture, critical issues, and actionable solutions for scaling and improving the codebase.

---

## Executive Summary

**Current State**: Functional v1 with solid security practices but monolithic, untested code that will become a maintenance nightmare as features scale.

**Key Issues**:

- 424-line monolithic renderer class
- No state management or single source of truth
- Brittle DOM manipulation patterns
- Unreliable task ID generation
- Zero test coverage
- Performance ceiling at ~100 tasks

**Effort**: ~4-5 weeks for complete refactor following the roadmap below.

---

## Detailed Analysis

### 1. Monolithic Renderer Logic

#### Problem

`src/renderer/app.js` is a 424-line single class handling:

- DOM manipulation
- Task CRUD operations
- Theme management
- Storage operations
- Keyboard shortcuts
- Animations
- Event binding
- UI state

This violates the Single Responsibility Principle. As the roadmap expands (multiple lists, tags, cloud sync, reminders, notifications), this file becomes unmaintainable and untestable.

#### Code Example (Current)

```javascript
class TodoWidget {
  constructor() {
    this.tasks = [];
    this.currentTheme = "dark";
    // ... 20 more methods doing everything
  }

  addTask(text) {
    /* task logic */
  }
  deleteTask(taskId) {
    /* DOM removal */
  }
  updateUI() {
    /* re-render everything */
  }
  applyTheme() {
    /* theme logic */
  }
  formatDate(dateString) {
    /* utility */
  }
  // ... 15 more methods in one class
}
```

## Automated Findings (2026-06-06)

**Summary of Problems Found**
- **Tests:** No test scripts, no test framework, and no CI configuration. There is no automated validation of behavior or regressions.
- **Linting / Formatting:** No ESLint/Prettier or format/lint scripts. Style and quality checks are missing.
- **Monolithic renderer:** `src/renderer/app.js` contains UI, business logic, storage, and event wiring in a single 400+ line class. This makes testing and maintenance hard.
- **Async/await misuse:** Several flows call `saveTasks()` without awaiting it (e.g., `addTask`), which can cause race conditions and data loss.
- **ID generation fallback:** The fallback uses a Math.random-based UUID pattern which can collide; prefer `crypto.randomUUID()` or a proven UUID library.
- **Unsafe DOM patterns:** `renderTasks()` builds HTML using `innerHTML` and then attaches listeners. Although `escapeHtml()` is used in places, relying on string templates increases XSS and maintainability risk. Prefer DOM APIs or a renderer module.
- **Large committed assets / build artifacts:** `src/renderer/styles.css` includes compiled Tailwind output committed to repo. `dist/` appears in the repo root. These should be created by the build pipeline and not committed.
- **Build / packaging inconsistencies:** `package.json` lists both `electron-packager` and `electron-builder` workflows; scripts are present but there's no guidance/CI to standardize releases.
- **Repository hygiene:** No `test`, `lint`, or `ci` scripts in `package.json`. No `.editorconfig`, no `.github/workflows`, and `node_modules/` is present locally (ensure `.gitignore`).
- **Accessibility:** Many interactive elements lack ARIA attributes and explicit keyboard affordances.
- **IPC surface:** `preload.js` exposes generic `getStoreValue` / `setStoreValue` endpoints which accept arbitrary keys; consider whitelisting keys or validating inputs to avoid accidental data overwrite.
- **Main process edge cases:** `createTray()` references `mainWindow` without null checks in some handlers. `app.on('window-all-closed')` intentionally preserves tray behavior but should have a comment clarifying intent.

**Recommended Next Steps (prioritized)**
1. Add a basic test suite and CI: create unit tests for pure logic (task manager), add `npm test`, and configure GitHub Actions to run tests on PRs.
2. Extract business logic from `src/renderer/app.js` into `modules/` (taskManager, storeService, uiRenderer). Keep `app.js` as orchestrator.
3. Add linting/formatting: install and configure ESLint + Prettier, add `lint` and `format` npm scripts, and enable pre-commit hooks (husky + lint-staged).
4. Move compiled CSS and other build artifacts out of the repo: add build step for Tailwind and remove `src/renderer/styles.css` and `dist/` from VCS; add to `.gitignore`.
5. Harden IPC: validate/whitelist store keys and add simple response/error forwarding so renderer can show user-friendly errors on failure.
6. Fix async bugs: `await` storage operations where consistency matters; surface storage errors to the UI.
7. Add accessibility improvements: ARIA labels on key buttons and support for keyboard-only users.
8. Add basic static analysis: run `npm audit` and review devDependencies; add an `engines` field to `package.json` to document supported Node/Electron versions.

**Quick actionable checklist**
- [ ] `npm test` + CI
- [ ] Extract `taskManager` and unit tests
- [ ] Add ESLint + Prettier + hooks
- [ ] Move Tailwind build into `npm run build` (remove compiled CSS from repo)
- [ ] Add IPC validation + error handling
- [ ] Accessibility fixes (ARIA + keyboard)

---

_This section was generated by an automated repository scan on 2026-06-06. If you'd like, I can start implementing the highest-priority items (tests + split renderer)._ 
 
## Architecture Recommendations

**Goals**
- Separate concerns (UI, business logic, persistence, platform glue)
- Make core logic testable without DOM or Electron runtime
- Provide a small, stable IPC contract between main and renderer
- Allow incremental refactor (small, verifiable steps)

**Proposed high-level layout**
```
src/renderer/
├── app.js                # Orchestrator: wires modules, minimal logic
├── index.html
├── styles.css            # Source tailwind input only — remove compiled output
├── modules/
│   ├── taskManager.js    # Pure JS: add/edit/delete/toggle/filter/sort
│   ├── storeService.js   # Persistence adapter: calls electronAPI and validates keys
│   ├── uiRenderer.js     # DOM-only rendering, event delegation
│   └── themeManager.js   # Theme apply/toggle and persistence
└── utils/
    ├── id.js             # Small wrapper for `crypto.randomUUID()` fallback
    ├── date.js
    └── sanitize.js
```

**State shape (single source of truth)**
```
{
  version: 1,            // migrations when shape changes
  tasks: [ { id, text, completed, createdAt, completedAt } ],
  ui: { theme, windowBounds, isAlwaysOnTop }
}
```

TaskManager responsibilities
- Pure functions for: createTask(text), updateTask(id, attrs), deleteTask(id), toggleTask(id), listTasks(filters)
- Emit events or return new state; do NOT touch DOM or call IPC directly

StoreService responsibilities
- Read/write state object atomically
- Validate whitelisted keys only (tasks, ui.theme, ui.windowBounds, ui.alwaysOnTop)
- Surface errors; return Promises that reject on failure

UIRenderer responsibilities
- Render given state to DOM using DOM APIs and event delegation
- Listen to user actions and call TaskManager APIs via app orchestrator

IPC contract (preload whitelist)
- `getState()` -> returns full state object
- `setState(state)` -> atomically persists full state (validate size/shape)
- `updateSettings(partial)` -> merges allowed ui keys only
- Avoid arbitrary `getStoreValue/setStoreValue` unless key is validated

Error handling
- All async persistence calls must be awaited by orchestrator and errors surfaced to UI (toasts/alerts)
- Add a retry/backoff for transient failures (3 attempts) and a clear user-visible error if persist fails

Testing & CI
- Unit test `taskManager` with Jest (no DOM) and `storeService` mocked IPC
- Add simple end-to-end smoke test for renderer using Playwright or electron-mocha in CI
- Add GitHub Actions workflow: `lint`, `test`, `build` on PRs

Incremental migration plan (safe, verifiable)
1. Create `src/renderer/modules/taskManager.js` with unit tests for core logic. (1–2 days)
2. Replace in-memory calls in `app.js` to use `taskManager` functions only; keep `renderTasks()` working. (0.5–1 day)
3. Implement `storeService.js` and change persistence to call `setState`/`getState` atomically; add IPC validation in `preload.js`. (1 day)
4. Extract `uiRenderer.js` to be a thin DOM adapter that accepts state objects and re-renders via diff/patch. (1–2 days)
5. Add CI (tests + lint) and remove compiled CSS from VCS. (1 day)

Metrics & performance
- For large task lists (>500), implement virtualization (windowing) in `uiRenderer`.
- Debounce frequent writes to store (e.g., edits) and batch-save after short throttle (300–500ms).

Security & accessibility
- Restrict IPC to minimal, validated endpoints and avoid passing executable data.
- Add ARIA labels and focus management in `uiRenderer`.

Estimated total effort for full refactor: 1–2 weeks (phased), can be done incrementally.

---

If you want, I can start by scaffolding `taskManager.js` and its unit tests now. Which step should I take next?

#### Impact

- Testing: Can't test task logic without DOM
- Debugging: One error affects multiple features
- Reusability: Can't extract business logic
- Collaboration: Merge conflicts inevitable
- Maintenance: Touching one feature risks breaking others

#### Solution: Module-Based Architecture

```bash
src/renderer/
├── app.js                    # Entry point, orchestration only
├── index.html
├── styles.css
├── modules/
│   ├── taskManager.js        # Pure task logic
│   ├── storeService.js       # Storage layer
│   ├── uiRenderer.js         # DOM rendering
│   ├── themeManager.js       # Theme handling
│   ├── keyboardHandler.js    # Keyboard shortcuts
│   └── notificationService.js # User feedback
├── utils/
│   ├── dateFormatter.js      # Utilities
│   ├── htmlEscaper.js
│   ├── idGenerator.js
│   └── constants.js
└── __tests__/
    ├── taskManager.test.js
    ├── storeService.test.js
    └── uiRenderer.test.js
```

### 2. No State Management

<b>Problem:</b>
State is manually synced across three sources with no single source of truth:

```javascript
// Problem: What if this fails?
await window.electronAPI.setStoreValue("tasks", this.tasks);
// UI is updated but storage failed. App is inconsistent.

// Problem: What if there are multiple updates?
this.addTask(text1); // saves to store
this.addTask(text2); // saves to store
// If one fails, we have 1 task but think we have 2
```
// No-op placeholder to ensure context — will append findings in next patch

If any save fails silently, the app is in an inconsistent state. There's no way to know what the actual state should be.

#### Impact

🔴 Data Loss: Tasks disappear if storage fails<br>
🔴 UI Mismatch: DOM doesn't reflect actual data<br>
🔴 No Undo/Redo: Can't track history<br>
🔴 Cloud Sync Impossible: Multiple sources of truth break sync<br>
🔴 Debugging Nightmare: State inconsistencies hard to reproduce

#### Current Code Issues

```javascript
// Problem: What if this fails?
await window.electronAPI.setStoreValue("tasks", this.tasks);
// UI is updated but storage failed. App is inconsistent.

// Problem: What if there are multiple updates?
this.addTask(text1); // saves to store
this.addTask(text2); // saves to store
// If one fails, we have 1 task but think we have 2
```
