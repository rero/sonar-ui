# Project Context

## Stack

- Angular 22
- Standalone components (no NgModule left)
- Zoneless change detection (`provideZonelessChangeDetection()`, no Zone.js)
- NgRx Signal Store for application state
- Signals preferred over RxJS
- TypeScript 6 with `strict: false` (`strictTemplates` and
  `strictInjectionParameters` are on); do not enable `strict` as a side effect
- Vitest through Analog (`@analogjs/vitest-angular`) with jsdom
- Optimus UI (components and theme), ngx-translate 18, Formly 11
- `@rero/ng-core` 22, with its `@rero/ng-core/editor` and
  `@rero/ng-core/katex` secondary entry points
- Node 24 (matches `.github/workflows/`)
- pnpm 12, pinned by the `packageManager` field of `package.json`

## Architecture principles

- Business logic should be isolated from Angular when possible.
- Prefer pure functions for reusable logic.
- Angular components should remain thin and focused on UI.

## Folder conventions

A single application, `projects/sonar/`, organized by feature under
`src/app/`: `_layout/`, `core/`, `dashboard/`, `deposit/`, `record/`,
`routes/`, `store/`, `guard/`, `pipe/`, `models/`. Components, services and
stores are colocated with their feature.

## Routing and lazy loading

- `app.routes.ts` loads the record routes lazily
  (`routes/<type>-route.ts`). Their resolvers live apart, in
  `routes/<type>-route.resolver.ts`: `app.routes.ts` imports only these, so
  the route files, and the editor they reference, stay out of the initial
  bundle.
- Formly is registered only on the routes that display forms, through
  `sonarFormlyProviders` (`routes/formly.providers.ts`) in their `providers`.
  Never import `@rero/ng-core/editor` or `@ngx-formly/core` from eagerly
  loaded code (`app.config.ts`, `app.routes.ts`, resolvers, layout): a
  single import pulls the whole editor and its Optimus UI components into
  the initial bundle. Load a dialog that needs Formly with a dynamic
  `import()` (see `FileItemComponent`).

## State management

State management uses **NgRx Signal Store** (`store/app.store.ts`,
`deposit/deposit.store.ts`).

Rules:

- Application state must use NgRx Signal Store.
- Component-local state should use Angular Signals.
- Do not use NgRx reducers/effects/store module.
- Do not introduce BehaviorSubject-based stores.

## CSS layers

Tailwind CSS v4 with Optimus UI and the `@openng/optimus-ui-tailwindcss`
plugin. The application classes use the `ui:` prefix, the ng-core ones the
`core:` prefix.

Layer order (lowest → highest priority):

```
theme < sonar-ui < optimus < utilities
```

- The order is declared in `src/index.html`, before the styles. In
  production, the SONAR backend templates (`sonar/theme/templates/sonar/`)
  declare it instead, with the `<style data-optimus-style-id="layer-order">`
  placeholder: keep both in sync.
- The application styles go in the `sonar-ui` layer, under the `.sonar-ui`
  class (`src/styles.scss`).

## Change detection

The application runs in **zoneless mode**: change detection relies on
signals. Do not rely on zone-based updates, `NgZone` or `zone.js`.
