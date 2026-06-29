// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiService } from '@rero/ng-core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserOrganisation } from '../models';

export type language = { code: string, name: string }

export type AppSettings = {
  document_identifier_link: unknown,
  availableLanguages: language[]
};

export type AppState = {
  user: User | null;
  organisation: UserOrganisation | null;
  permissions: Record<string, Record<string, boolean>> | null;
  settings: AppSettings;
};

export type AppStoreType = InstanceType<typeof AppStore>;

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState<AppState>({
    user: null,
    organisation: null,
    permissions: null,
    settings: {
      document_identifier_link: {},
      availableLanguages: []
    },
  }),
  withComputed((store, apiService = inject(ApiService)) => ({
    isLogged: () => store.user() !== null,
    availableLanguages: () => store.settings()?.availableLanguages ?? [],
    isDedicatedOrganisation: () => {
      const org = store.organisation();
      return org != null && 'isDedicated' in org && !!org.isDedicated;
    },
    userRefEndpoint: () => apiService.getRefEndpoint('users', store.user()!.pid),
    publicInterfaceLink: () => {
      const org = store.organisation();
      return org?.isDedicated ? `/${org.code}` : '/';
    },
  })),
  withMethods((store, http = inject(HttpClient), apiService = inject(ApiService)) => ({
    load(): Observable<void> {
      return http
        .get<{ metadata?: User & { is_user?: boolean; organisation?: UserOrganisation; permissions?: Record<string, Record<string, boolean>> }; settings?: AppSettings | null }>(
          `${apiService.baseUrl}/logged-user/?resolve=1`
        )
        .pipe(
          tap((response) => {
            const { settings } = response;
            if (settings) {
              patchState(store, { settings });
            }
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

  }))
);
