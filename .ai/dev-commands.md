# Development Commands

These are the official commands for working with this repository.
LLM tools should prefer these commands instead of inventing new ones.

## Install dependencies

pnpm install

## Development server

Start the development server, with the API proxied to the SONAR backend on
`https://localhost:5000` (`proxy.conf.json`):

pnpm run serve

## Build

pnpm run build

## Tests

pnpm test

## Lint

pnpm run lint

## Format

Run Prettier (imports sorted by `@ianvs/prettier-plugin-sort-imports`):

pnpm run format

Check the formatting, as the CI does:

pnpm run format:check

## Translations

Extract the translation keys:

pnpm run extract_messages

Update the translation catalogs (`src/assets/i18n/`):

pnpm run update_catalog

## Pack

Build the application in production mode and pack it as
`rero-sonar-ui-X.X.X.tgz` at the repository root, to install it in the SONAR
backend (`scripts/bootstrap -t <tgz>` in the `sonar` repository):

pnpm run pack

## Unpublished ng-core

To use a local ng-core build, pack it (`pnpm run pack` in `../ng-core`) and
add an override to `pnpm-workspace.yaml`, then `pnpm install`:

```yaml
overrides:
  '@rero/ng-core': 'file:../ng-core/rero-ng-core-X.X.X.tgz'
```

Never commit this override nor the lockfile it changes: the CI builds ng-core
from the ref in `.ng-core-ref` instead.
