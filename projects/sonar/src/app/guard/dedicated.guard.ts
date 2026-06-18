// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { AppStore } from '../store/app.store';

/** Allow access only for users whose organisation is dedicated. */
export const dedicatedGuard = () => {
  const store = inject(AppStore);
  return toObservable(store.user).pipe(
    filter(user => user !== null),
    map(() => store.isDedicatedOrganisation())
  );
};
