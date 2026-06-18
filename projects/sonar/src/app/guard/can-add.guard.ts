// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AppStore } from '../store/app.store';

export const canAddGuard = (next: ActivatedRouteSnapshot) => {
  const store = inject(AppStore);
  return toObservable(store.permissions).pipe(
    filter(permissions => permissions !== null),
    map(permissions => {
      const perms = permissions as Record<string, Record<string, boolean>>;
      return perms[next.params['type']]?.['add'] ?? false;
    })
  );
};
