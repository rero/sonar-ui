// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AppStore } from '../store/app.store';

/** Check if the current logged user has a specific role. The role to check should be passed
 *  using route.data.role.
 *
 *  USAGE:
 *  { path: 'new', component: MyComponent, canActivate: [roleGuard], data: { role: 'xxx' } }
 */
export const roleGuard = (next: ActivatedRouteSnapshot) => {
  const store = inject(AppStore);
  return toObservable(store.user).pipe(
    filter(user => user !== null),
    map(() => store.is(next.data.role || 'user'))
  );
};
