# Prompt Templates

These prompt templates help guide the LLM when performing common tasks in this repository.

---

## Refactor Angular component

Goal: simplify this component.

Constraints:

- Angular 22, standalone and OnPush by default (no explicit property)
- do not introduce NgModules
- use inject(), not constructor injection
- move business logic outside components when possible
- prefer Angular Signals over RxJS for local state
- use the input()/output() APIs
- do not change the behaviour

---

## Fix Angular test

Goal: update this test to match the current component.

Constraints:

- Vitest (`describe`, `it`, `expect`, `vi.fn()`, `vi.spyOn()`)
- no Karma, no Jasmine, no fakeAsync
- keep TestBed only when Angular integration is required

---

## Improve typing

Goal: improve TypeScript typing.

Constraints:

- do not introduce `any`
- prefer explicit types

---

## Write unit test

Goal: write a unit test for the provided code.

Constraints:

- use Vitest
- prefer pure function testing
- avoid TestBed unless Angular integration is required
- keep the test minimal and readable
