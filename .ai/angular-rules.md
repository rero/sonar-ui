# Angular Rules

Framework version: Angular 22

## Core rules

- Use standalone components only. Standalone is the default since
  Angular 19 — do not set `standalone: true` explicitly, and never set
  `standalone: false`.
- Do not introduce NgModules.
- Prefer Angular Signals for local state.
- Avoid RxJS when Signals are sufficient.
- Use explicit TypeScript types.

## Component design

- Components must remain small and focused on UI.
- Business logic should not live inside components.
- Move reusable logic to services or pure functions.

## Change detection

- OnPush is the default change detection strategy since Angular 22. Do not
  set `changeDetection: ChangeDetectionStrategy.OnPush` on new components;
  the existing explicit ones can stay.

## Dependency injection

- Use `inject()`, not constructor parameters.
- Avoid unnecessary services; prefer simple utility functions when Angular
  DI is not needed.
- Use `@Service()` instead of `@Injectable({ providedIn: 'root' })` for new
  root-provided services (available since Angular 22).
- Use `@Service({ autoProvided: false })` instead of a bare `@Injectable()`
  for services that must be registered in a `providers` array.

## Templates

- Use the control flow syntax: `@if`, `@for`, `@switch`. Do not introduce
  `*ngIf`, `*ngFor` or `*ngSwitch`.
- Translate with the pipe, `{{ 'Key' | translate }}` or
  `[label]="'Key' | translate"`. Never use the element content as key
  (`<span translate>Key</span>`) nor a bare `translate` attribute:
  ngx-translate 18 warns for each element and removes it in version 19.
- Mark an `ngModel` that only drives a control of the component itself with
  `[ngModelOptions]="{ standalone: true }"`: Angular 22 warns when an
  `ngModel` sits in a parent form it cannot register with.

## Inputs and outputs

- Use the `input()`, `output()` and `model()` APIs, not the `@Input()` and
  `@Output()` decorators.

## State management

1. Local component state → Angular Signals
2. Application state → NgRx Signal Store

Use `@ngrx/signals`: `signalStore`, `withState`, `withMethods`,
`withComputed`, `signalStoreFeature`, `patchState`.

Do not introduce NgRx Store reducers/effects, BehaviorSubject stores or
custom RxJS state services.

## Code quality

- Avoid the use of `any`.
- Prefer explicit types.
- Keep functions small and testable.
- All code comments must be written in English.

## Zoneless mode

- Do not rely on zone-based change detection.
- Prefer Angular Signals to trigger updates.
- Avoid patterns requiring `NgZone`.
- Do not introduce `zone.js` dependencies.
