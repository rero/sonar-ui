# Project Context

## Stack

- Angular 21
- TypeScript strict mode
- Zone.js (zoneless migration planned but not yet done)
- NgRx Signal Store for application state
- Signals preferred over RxJS for new code
- Karma + Jasmine for testing (Vitest migration planned)
- Node 20+

## Migration status

This project is in active migration from Angular 19 to Angular 21 patterns:

- NgModules still present — migration to standalone components in progress
- Zone.js still active — zoneless migration not yet started
- Karma/Jasmine still used — Vitest migration planned for a later phase
- New code should follow Angular 21 patterns (standalone, signals, inject())

## Architecture principles

- Business logic should be isolated from Angular when possible.
- Prefer pure functions for reusable logic.
- Angular components should remain thin and focused on UI.

