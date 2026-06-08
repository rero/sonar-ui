/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
