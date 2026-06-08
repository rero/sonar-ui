/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiService } from '@rero/ng-core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserOrganisation } from '../models';

export type AppSettings = { document_identifier_link: unknown };

export type AppState = {
  user: User | null;
  organisation: UserOrganisation | null;
  permissions: Record<string, Record<string, boolean>> | null;
  settings: AppSettings | null;
};

export type AppStoreType = InstanceType<typeof AppStore>;

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState<AppState>({
    user: null,
    organisation: null,
    permissions: null,
    settings: null,
  }),
  withComputed((store) => ({
    isLogged: () => store.user() !== null,
  })),
  withMethods((store, http = inject(HttpClient), apiService = inject(ApiService)) => ({
    load(): Observable<void> {
      return http
        .get<{ metadata?: User & { is_user?: boolean; organisation?: UserOrganisation; permissions?: Record<string, Record<string, boolean>> }; settings?: AppSettings | null }>(
          `${apiService.baseUrl}/logged-user/?resolve=1`
        )
        .pipe(
          tap((response) => {
            const settings = response.settings ?? null;
            patchState(store, { settings });
            if (response.metadata?.is_user) {
              const { organisation, permissions, ...rest } = response.metadata;
              patchState(store, {
                user: rest as User,
                organisation: organisation ?? null,
                permissions: permissions ?? null,
              });
            }
          }),
          map(() => undefined),
          catchError(() => EMPTY)
        );
    },

    hasRole(roles: string | string[]): boolean {
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(store.user()?.role ?? '');
    },

    is(role: string): boolean {
      return store.user()?.['is_' + role] === true;
    },

    checkUserReference(reference: string): boolean {
      const result = /[0-9]+$/.exec(reference);
      return result !== null && store.user()?.pid === result[0];
    },

    checkUserPid(pid: string): boolean {
      return store.user()?.pid === pid;
    },

    isDedicatedOrganisation(): boolean {
      const org = store.organisation();
      return org != null && 'isDedicated' in org && !!org.isDedicated;
    },

    getUserRefEndpoint(): string {
      return apiService.getRefEndpoint('users', store.user()!.pid);
    },

    getPublicInterfaceLink(): string {
      const org = store.organisation();
      return org?.isDedicated ? `/${org.code}` : '/';
    },
  }))
);
