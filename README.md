# [SONAR UI][1]

[![Build Status](https://github.com/rero/sonar-ui/workflows/CI/badge.svg)](https://github.com/rero/sonar-ui/actions)
[![npm version](https://badge.fury.io/js/%40rero%2Fsonar-ui.svg)](https://badge.fury.io/js/%40rero%2Fsonar-ui)
[![License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0.html)
[![Translation status](https://hosted.weblate.org/widgets/rero_plus/-/sonar-ui/svg-badge.svg)](https://hosted.weblate.org/engage/rero_plus/?utm_source=widget)

Copyright (C) 2019- RERO

[1]: https://github.com/rero/sonar-ui

## Introduction

**SONAR UI** is the user interface of [SONAR](https://github.com/rero/sonar),
the Swiss Open Access Repository. It is made with [Angular](https://angular.dev)
22 and [@rero/ng-core](https://github.com/rero/ng-core).

## Requirements

- [Node.js 24](https://nodejs.org/)
- [pnpm 12](https://pnpm.io/) (the exact version is set in the `packageManager`
  field of `package.json`)
- [sonar](https://github.com/rero/sonar) installed and running on
  `https://localhost:5000`

## Quick start

```bash
pnpm install
pnpm run serve   # dev server, with the API proxied to https://localhost:5000
```

## Commands

| Command                 | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `pnpm run serve`        | Development server with the API proxy                |
| `pnpm run build`        | Production build in `dist/sonar`                     |
| `pnpm test`             | Unit tests (Vitest)                                  |
| `pnpm run lint`         | ESLint                                               |
| `pnpm run format`       | Format the code with Prettier (imports sorted)       |
| `pnpm run format:check` | Check the formatting, as the CI does                 |
| `pnpm run pack`         | Production build packed as `rero-sonar-ui-X.X.X.tgz` |
| `./run-tests.sh`        | Formatting, lint, tests and build, as the CI does    |

To install a pack in a local SONAR, pass it to the bootstrap script of sonar:
`./scripts/bootstrap -t ../sonar-ui/rero-sonar-ui-X.X.X.tgz`.

## Using an unpublished ng-core

Pack ng-core (`pnpm run pack` in `../ng-core`), add an override to
`pnpm-workspace.yaml`, then run `pnpm install`:

```yaml
overrides:
  '@rero/ng-core': 'file:../ng-core/rero-ng-core-X.X.X.tgz'
```

Do not commit this override. The CI builds ng-core from the reference written in
`.ng-core-ref` (`published`, a branch of rero/ng-core, or `owner/ng-core@branch`).

## Styles

The CSS layers are ordered `theme, sonar-ui, optimus, utilities`. The order is
declared in `src/index.html` and, in production, in the templates of the sonar
backend: keep them in sync (see `.ai/project-context.md`).
