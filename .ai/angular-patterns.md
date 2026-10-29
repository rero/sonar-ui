# Angular Patterns

## Component

Standalone and OnPush are the defaults: no `standalone` or
`changeDetection` property.

```typescript
@Component({
  selector: 'sonar-my-component',
  imports: [TranslatePipe],
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  private readonly router = inject(Router);

  readonly item = input.required<Item>();
  readonly limit = input<number>(10);
  readonly selected = output<Item>();

  readonly count = signal(0);
  readonly doubled = computed(() => this.count() * 2);

  increment(): void {
    this.count.update((value) => value + 1);
  }
}
```

## RxJS interop

Use `toSignal()` and `takeUntilDestroyed()`.

```typescript
export class MyComponent {
  private readonly service = inject(MyService);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = toSignal(this.service.getData());

  constructor() {
    this.service.stream$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
```

## NgRx Signal Store

The state signals are read-only: update them with `patchState()`.

```typescript
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0 }),
  withMethods((store) => ({
    increment(): void {
      patchState(store, (state) => ({ count: state.count + 1 }));
    },
  })),
);
```

## Record route with an editor

The routes of a record type live in `routes/<type>-route.ts`, loaded lazily,
and register Formly for their editors:

```typescript
import { Routes } from '@angular/router';
import { RecordSearchPageComponent } from '@rero/ng-core';
import { EditorComponent } from '@rero/ng-core/editor';

import { sonarFormlyProviders } from './formly.providers';

export const usersRoutes: Routes = [
  {
    path: '',
    providers: sonarFormlyProviders,
    children: [
      { path: '', component: RecordSearchPageComponent },
      { path: 'edit/:pid', component: EditorComponent },
      { path: 'new', component: EditorComponent },
    ],
  },
];
```

Its resolver goes in `routes/<type>-route.resolver.ts`, which
`app.routes.ts` imports:

```typescript
{
  matcher: recordMatcher('users'),
  loadChildren: () => import('./routes/users-route').then((m) => m.usersRoutes),
  resolve: { types: usersRouteResolver },
}
```

## Dialog with a form

A dialog that displays a Formly form is loaded on demand, from a component
of a route that registers Formly:

```typescript
async showEditor(): Promise<void> {
  const { FileItemEditorComponent } = await import('../file-item-editor/file-item-editor.component');
  this.dialogService.open(FileItemEditorComponent, { /* ... */ });
}
```
