# Plan de migration Angular 21 — sonar-ui

## Contexte

Migration de sonar-ui vers Angular 21 patterns complets :
- 100% standalone components
- `input()` / `output()` / `model()`
- Signals, `computed()`, `effect()`
- `inject()` (déjà largement en place — 124 occurrences)
- `@if` / `@for` / `@switch` dans les templates (déjà fait ✅)
- Zoneless (suppression de Zone.js)
- Vitest (remplacement de Karma/Jasmine)
- Types ng-core à la place des `any` liés aux entités
- Utilise en priorité les outils de migrations proposés par Angular : https://angular.dev/reference/migrations
- Quand les `any` sont remplacés par ceux de ng-core (en particulier `RecordType` pour les route data), mentionner les propriétés inconnues de ng-core — elles seront rajoutées à la lib

**Hors scope pour l'instant :** migration des stores RxJS existants vers NgRx Signal Store.

## Référence

Le projet **ng-core-tester** (`../ng-core/projects/ng-core-tester`) est l'application de démonstration de ng-core migré. S'en inspirer pour les patterns de bootstrap, configuration, et usage des composants ng-core.

---

## État de départ

| Projet | Composants | Services/Guards | Pipes | NgModules | Tests |
|---|---|---|---|---|---|
| sonar | 34 | 9 | 8 | 3 | 26 |
| **Total** | **34** | **9** | **8** | **3** | **26** |

### Ce qui est déjà fait

- ✅ Angular 21 upgrade
- ✅ `@if` / `@for` / `@switch` dans tous les templates (0 `*ngIf`/`*ngFor` restants)
- ✅ `inject()` largement adopté (124 occurrences)
- ✅ Adoption partielle de `input()`/`output()` dans les composants récents
- ✅ Adoption partielle des signals dans les composants récents

### Ce qui reste à faire

- ❌ Standalone components (0/34 composants convertis)
- ❌ `input()`/`output()` complet (36+ `@Input`/`@Output` restants)
- ❌ `ChangeDetectionStrategy.OnPush` (0 composants)
- ❌ Zoneless (Zone.js actif)
- ❌ Vitest (Karma/Jasmine encore actif)
- ❌ Types ng-core (119 `any` présents)

---

## Phase 0 — Compatibilité ng-core ✅

> Objectif : compiler sans erreur avec la version courante de ng-core avant toute migration.

- [x] Identifier les breaking changes ng-core (API publique, types renommés, modules supprimés)
- [x] Corriger les imports cassés dans `sonar`
- [x] Vérifier que `ng build sonar` passe sans erreur
- [ ] Vérifier que `ng test` passe (Karma, baseline de référence)

---

## Phase 1 — Standalone ✅ (partielle)

> Objectif : 100% standalone, supprimer AppModule, bootstrap via `bootstrapApplication`.

### 1.1 Composants, pipes, directives

- [x] Convertir les 34 composants en `standalone: true`
  - Schematic : `ng g @angular/core:standalone-migration --mode=convert-to-standalone`
- [x] Convertir les 8 pipes en `standalone: true`
- [x] Convertir les guards en fonctions (functional guards)

### 1.2 Bootstrap standalone

- [x] Migrer `main.ts` vers `bootstrapApplication(AppComponent, appConfig)`
- [x] Supprimer `AppModule` et `RecordWrapperModule`
- [x] `TranslateModule.forRoot()` → `provideTranslateService`
- [x] `provideCore()` ajouté (Formly, MessageService, ConfirmationService)
- [ ] Supprimer `AppRoutingModule` (routes encore dans un NgModule) → Phase 1.3
- [ ] Créer `app.config.ts` propre (actuellement tout est dans `main.ts`)

### 1.3 Migration routing ✅

- [x] Extraire la logique du constructeur `AppRoutingModule` vers `RouteService`
  - `provideEnvironmentInitializer(() => inject(RouteService).initializeRoutes())`
- [x] Convertir `app-routing.module.ts` → `app.routes.ts` (tableau `Routes` simple)
- [x] Utiliser `provideRouter(routes)` dans `main.ts`
- [x] Supprimer `AppRoutingModule`

### Notes techniques
- `RecordModule` / `CoreModule` de ng-core → remplacés par `provideCore()` et imports standalone directs
- `AppRoutingModule` toujours présent comme NgModule : le constructeur fait de l'initialisation dynamique des routes

---

## Phase 2 — `input()` / `output()` / `model()` et OnPush ✅

> Objectif : remplacer tous les `@Input()` / `@Output()` par l'API Signals.

- [x] `@Input()` → `input()` / `input.required()` sur tous les composants
- [x] `@Output()` → `output()` sur tous les composants
- [x] `@Input() set prop` → `input()` + `effect()` en constructeur
- [x] `ngOnChanges` → `effect()` en constructeur
- [x] Templates mis à jour : `record.` → `record()?.` partout
- [x] Specs mises à jour : `component.x = val` → `fixture.componentRef.setInput('x', val)`
- [x] Ajouter `ChangeDetectionStrategy.OnPush` sur **tous** les composants

### Notes techniques
- Les composants detail (`collection/detail`, `project/detail`, `hepvs/project/detail`) reçoivent un `Observable` via un input `record$` — pattern imposé par ng-core's `DetailComponent` wrapper qui appelle `inputBinding('record$', ...)`.
- `model()` non utilisé : aucun cas de mutation bidirectionnelle identifié dans sonar.

---

## Phase 3 — Signals ✅ (partielle)

> Priorité : remplacer `async` pipe par `toSignal()` pour les observables de composant.

- [x] Remplacer `async` pipe par `toSignal()` dans les composants ciblés
  - `confirmation.component.ts` : `deposit$` observable → `deposit = toSignal(...)`
  - `collection/detail/detail.component.ts` : `record$ | async` → `record = toSignal(...)`
  - `project/detail/detail.component.ts` : `record$ | async` + `user$ | async` → signals
  - `hepvs/project/detail/detail.component.ts` : templates mis à jour
- [x] Supprimer `AsyncPipe` des `imports` quand elle n'est plus nécessaire
- [x] **Pas de nouveau RxJS store** — les stores existants restent en l'état

### Pattern detail components (observable en input)
```typescript
record$ = input.required<Observable<any>>();
record = toSignal(
  toObservable(this.record$).pipe(switchMap(obs$ => obs$)),
  { initialValue: null }
);
```

### Ce qui reste
- [ ] Remplacer les `BehaviorSubject` locaux par `signal()` (non prioritaire)
- [ ] Utiliser `computed()` pour les valeurs dérivées (non prioritaire)

---

## Phase 4 — Zoneless ✅ (partielle)

> Zone.js supprimé du runtime applicatif. Zone.js de test supprimé avec Phase 5 (Vitest).

- [x] Ajouter `provideZonelessChangeDetection()` dans `main.ts` (premier provider)
- [x] Supprimer `import 'zone.js'` dans `polyfills.ts` (bundle polyfills : 89 kB → 38 bytes)
- [x] `import 'zone.js/testing'` supprimé (fichier `test.ts` supprimé en Phase 5)
- [ ] Retirer `zone.js` des dépendances `package.json` — **bloqué** : ng-core dépend encore de zone.js

---

## Phase 5 — Vitest

> Remplacer Karma/Jasmine par Vitest.

- [x] Configurer Vitest pour `sonar` (`vite.config.mts`, `tsconfig.spec.json`)
- [x] Supprimer `karma.conf.js` et `test.ts`
- [x] Migrer les 26 fichiers `.spec.ts` (Jasmine API → Vitest API)
  - `describe`/`it`/`expect` : identiques
  - `spyOn` → `vi.spyOn`
  - `jasmine.createSpy` → `vi.fn()`
  - `fakeAsync`/`tick` → `vi.useFakeTimers()`/`vi.advanceTimersByTimeAsync()`
  - `jasmine.createSpyObj` → objet avec `vi.fn()`
- [x] Vérifier : 41 tests, 0 échecs (26 fichiers)

### Corrections appliquées
- `resolve.dedupe` pour `@angular/core` et autres dans `vite.config.mts` → résout le double-instance `@angular/core` (ng-core lié localement via symlink)
- Mocks globaux dans `test-setup.ts` : `window.matchMedia`, `ResizeObserver` (PrimeNG)
- `FormlyModule.forRoot({})` requis dans les specs qui utilisent `EditorComponent`
- `ConfirmationService`/`MessageService` à fournir explicitement quand un composant enfant les utilise
- `TranslateService.use('en')` avant `detectChanges()` quand le composant accède à `currentLang`

### Notes techniques
- `DateTranslatePipe` et autres pipes ng-core utilisant `inject()` comme field initializer : à mocker via `TestBed.overrideComponent` si double-instance `@angular/core` (ng-core lié localement).
- `ProxyZone` non disponible sans zone.js testing — utiliser `vi.useFakeTimers()`.

---

## Phase 6 — Typage ng-core et nettoyage final ✅

> Objectif : supprimer les `any` liés aux types ng-core.

### Modèles domaine créés (`app/models/`)
- [x] `User` / `UserOrganisation` — pid, role, is_moderator, organisation, permissions
- [x] `Deposit` / `DepositFile` / `DepositStatus` — pid, status, user.$ref, _files, diffusion

### Services et guards
- [x] `UserService` — `BehaviorSubject<User | null>`, `Observable<User | null>`, HTTP response typé
- [x] `DepositService` — paramètres `Deposit`/`DepositFile`, retours `Observable<{metadata: Deposit}>`, HTTP calls typés
- [x] `RouteService` — `RecordData`, `File` (ng-core), `User`, `UrlSegment[]`, `Route`, interface `RecordRouteConfig` locale
- [x] Guards (`canAdd`, `canList`) — `map((user: User) => ...)`
- [x] `UIAutocompleteService` — HTTP response typé, `ISuggestionItem[]`
- [x] `AppTranslateLoader` — `Observable<Record<string, string>>`, `User | null`, label lookup typé
- [x] `BucketNameService` — record response typé inline
- [x] `AppConfigService` — `settings.document_identifier_link: unknown`

### Classes utilitaires
- [x] `AggregationFilter` — `RawAggregations`, `Bucket` (ng-core) pour les callbacks

### Composants (28 fichiers)
- [x] Brief views (collection, project, organisation, subdivision) — `record = input.required<RecordData>()`
- [x] Detail document — `record$: Observable<RecordData>`, `goToOtherFile(event: MouseEvent, ...)`
- [x] `DocumentComponent`, `ContributionsComponent` — `RecordData`, `MouseEvent`
- [x] `BriefViewComponent` (deposit) — `record: RecordData`, `user: User | null`
- [x] `ReviewComponent` — `deposit = input.required<Deposit>()`, `user: User | null`
- [x] `FilesComponent` — `mainFile = input.required<DepositFile>()`
- [x] `MetadataComponent` — `deposit = signal<Deposit | null>(null)`
- [x] `ValidationComponent` — `RecordData`, `User | null`, subscribe typé
- [x] `AdminComponent` — `user: User | null`
- [x] `FieldDescriptionComponent` — `field = input<unknown>()`
- [x] `FileComponent` (document) — `statistics = input<unknown>()`
- [x] `StatsFilesComponent` — `record = input.required<RecordData>()`
- [x] `UserComponent` — `record = input.required<RecordData>()`
- [x] `EditorComponent` — `Deposit`, `FormlyFieldConfig`, `UntypedFormGroup`, `markAsTouched()`
- [x] `SwisscoveryComponent` — `output<Record<string, unknown> | null>()`, HTTP response typé
- [x] `UploadComponent` — subscribe typé
- [x] `UploadFilesComponent` — interfaces `RecordFile`/`RecordFileMeta`/`RecordWithFiles` locales, HTTP calls typés
- [x] `OtherFilesComponent` — `Observable<File[]>`, raw API response `Record<string, unknown>[]`
- [x] `FileItemComponent` — `input<Record<string, unknown>>()`, `output<...>()`
- [x] `FileItemEditorComponent` — `FormlyFieldConfig[]`, `Record<string, unknown>`, `as any` pour JSONSchema
- [x] `OrganisationDetailComponent` — `Observable<RecordData>`, subscribe typé
- [x] `DocumentDetailComponent` — `sortAbstracts` sort callbacks typés

### Pipes
- [x] `LanguageValuePipe` — `Record<string, string>[]`
- [x] `ContributorsPipe` — `IContribution[]` retour et callbacks sort
- [x] `HighlightJsonPipe` — retour `SafeHtml`, callback `string`
- [x] `FileLinkPipe` — paramètre `key: string`
- [x] `JoinPipe` — `...args: string[]`
- [x] `PublicationPipe` — interface locale `PartOf`

### Types ng-core utilisés
- `RecordData` — records génériques (remplace la plupart des `record: any`)
- `File` (as `NgCoreFile`) — objets fichiers dans `fileConfig`
- `ActionStatus` — déjà présent avant la phase
- `Bucket` — dans `AggregationFilter`

### Résultat final
- 1 `any` résiduel (eslint-disable) : `getSchemaForm()` → accès `res.schema.properties._files.items` (JSONSchema opaque)
- 41 tests, 0 échecs

### Ce qui reste
- [ ] `ng lint` → 0 warnings NG8113 (bindings inutilisés)

---

## Maintenance du plan

Mettre à jour `CLAUDE.md` et `.ai/` à la fin de chaque phase pour refléter le nouvel état du projet.
