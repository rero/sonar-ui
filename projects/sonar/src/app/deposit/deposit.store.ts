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
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Deposit, DepositFile } from '../models/deposit.model';
import { AppStore } from '../store/app.store';
import { DepositService } from './deposit.service';

type DepositState = {
  deposit: Deposit | null;
  schema: object | null;
  isLoading: boolean;
  error: string | null;
};

export type DepositStoreType = InstanceType<typeof DepositStore>;

export const DepositStore = signalStore(
  withState<DepositState>({
    deposit: null,
    schema: null,
    isLoading: false,
    error: null,
  }),
  withComputed((store) => {
    const appStore = inject(AppStore);
    return {
      canAccess: computed(() => {
        const deposit = store.deposit();
        if (!deposit) return false;
        const { status } = deposit;
        if (
          (status === 'in_progress' || status === 'ask_for_changes') &&
          appStore.checkUserReference(deposit.user.$ref)
        ) {
          return true;
        }
        return status === 'to_validate' && !!appStore.user()?.['is_moderator'];
      }),
      mainFile: computed(() => store.deposit()?._files?.[0] ?? null),
      additionalFiles: computed(() => store.deposit()?._files?.slice(1) ?? []),
      maxStep: computed(() => store.deposit()?.step ?? 'metadata'),
    };
  }),
  withMethods((store, depositService = inject(DepositService)) => ({
    load(id: string): Observable<void> {
      patchState(store, { isLoading: true, error: null });
      return depositService.get(id).pipe(
        tap((result) => {
          const files = [...(result.metadata._files ?? [])].sort(
            (a: DepositFile, b: DepositFile) => (a.order ?? 0) - (b.order ?? 0)
          );
          patchState(store, {
            deposit: { ...result.metadata, _files: files },
            isLoading: false,
          });
        }),
        map(() => undefined),
        catchError((err: Error) => {
          patchState(store, { isLoading: false, error: err.message });
          return throwError(() => err);
        })
      );
    },

    create(): Observable<{ metadata: Deposit; [key: string]: unknown }> {
      return depositService.create().pipe(
        tap((result) => patchState(store, { deposit: result.metadata }))
      );
    },

    update(
      id: string,
      data: Record<string, unknown>
    ): Observable<{ metadata: Deposit; [key: string]: unknown } | null> {
      return depositService.update(id, data).pipe(
        tap((result) => {
          if (result) {
            patchState(store, { deposit: result.metadata });
          }
        })
      );
    },

    delete(deposit: Deposit): Observable<unknown> {
      return depositService.delete(deposit).pipe(
        tap(() => patchState(store, { deposit: null }))
      );
    },

    publish(id: string): Observable<unknown> {
      return depositService.publish(id);
    },

    removeFile(id: string, name: string, versionId: string | null = null): Observable<unknown> {
      return depositService.removeFile(id, name, versionId);
    },

    loadSchema(type: string): Observable<object> {
      const currentSchema = store.schema();
      if (currentSchema !== null) {
        return of(currentSchema);
      }
      return depositService.getJsonSchema(type).pipe(
        tap((schema) => patchState(store, { schema }))
      );
    },

    reviewDeposit(
      deposit: Deposit,
      action: string,
      comment: string | null = null
    ): Observable<unknown> {
      return depositService.reviewDeposit(deposit, action, comment);
    },

    extractPDFMetadata(deposit: Deposit): Observable<Record<string, unknown>> {
      return depositService.extractPDFMetadata(deposit);
    },

    mergeDeposit(updates: Partial<Deposit>): void {
      const current = store.deposit();
      if (current) {
        patchState(store, { deposit: { ...current, ...updates } });
      }
    },
  }))
);
