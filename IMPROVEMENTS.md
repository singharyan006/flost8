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
