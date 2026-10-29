# Testing Rules

Testing framework: Vitest, through Analog (`@analogjs/vitest-angular`).

## Allowed testing APIs

- `describe()`, `it()`, `expect()`, `beforeEach()`, `afterEach()`
- Spies and mocks: `vi.fn()`, `vi.spyOn()`

## Do not use

- Karma, Jasmine (`jasmine.createSpy`, `jasmine.clock`, `spyOn`)
- `fakeAsync`, `tick`, `flush`, `waitForAsync`: the application is zoneless

## Angular testing

Prefer tests that do not require Angular. Priority order:

1. Pure function tests
2. Service tests without TestBed
3. Angular integration tests using TestBed

Use TestBed only when Angular features are required (dependency injection,
component rendering, directives, pipes). When testing components:

- import standalone components directly;
- avoid large testing modules;
- mock dependencies with simple objects when possible.

```ts
describe('computeSomething', () => {
  it('should double the value', () => {
    expect(computeSomething(2)).toBe(4);
  });
});
```

## Test environment

- The tests run in jsdom (`projects/sonar/vite.config.mts`), not in a real
  browser.
- `src/test-setup.ts` sets up the TestBed and mocks the browser APIs that
  jsdom lacks and Optimus UI uses (`ResizeObserver`, `matchMedia`, …): add
  the missing ones there, not in each spec.

## Asynchronous code

- Use `async`/`await`.
- `setTimeout(() => { expect(...) }, N)` **without await** leaks into the
  following tests. Write instead:

  ```ts
  await new Promise((resolve) => setTimeout(resolve, N));
  expect(...);
  ```

- `router.navigate()` returns a Promise: always `await` it for the title or
  the state to update. `await Promise.resolve()` is not enough.

## Vitest gotchas

- Spy types: prefer a narrow partial test type or an explicit local mock
  interface over `MockedObject<T>` for partial mocks, rather than `any`.
- `.compileComponents()` is unnecessary.

## @ngx-translate/core in tests

`@ngx-translate/core` 18 is standalone only — `TranslateModule` no longer
exists. Register it with `provideTranslateService()` in `providers`:

```ts
TestBed.configureTestingModule({
  imports: [MyComponent],
  providers: [provideTranslateService()],
});
```

`setDefaultLang()` was removed: use `setFallbackLang()`.

## @ngx-formly/core/testing

- `createFieldComponent()` returns `{ query, queryAll, fixture, ... }`
- `query(selector)` → single `DebugElement` (null if not found)
- `queryAll(selector)` → `DebugElement[]` — use for `toHaveLength(N)`
  assertions
