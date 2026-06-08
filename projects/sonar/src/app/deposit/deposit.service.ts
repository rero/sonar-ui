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
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService, processJsonSchema, RecordService, removeEmptyValues, resolve$ref } from '@rero/ng-core';
import { MessageService } from 'primeng/api';
import { concat, from, Observable, of, throwError } from 'rxjs';
import { catchError, ignoreElements, map, mergeMap, reduce, tap } from 'rxjs/operators';
import { Deposit, DepositFile } from '../models/deposit.model';
import { AppStore, AppStoreType } from '../store/app.store';

@Injectable({
  providedIn: 'root'
})
export class DepositService {

  private apiService: ApiService = inject(ApiService);
  private httpClient: HttpClient = inject(HttpClient);
  private store = inject(AppStore);
  private messageService: MessageService = inject(MessageService);
  private translateService: TranslateService = inject(TranslateService);
  private recordService: RecordService = inject(RecordService);

  get depositEndPoint(): string {
    return `${this.apiService.getEndpointByType('deposits', true)}`;
  }

  get(id: string): Observable<{ metadata: Deposit; [key: string]: unknown }> {
    return this.httpClient.get<{ metadata: Deposit; [key: string]: unknown }>(`${this.apiService.getEndpointByType('deposits', true)}/${id}`).pipe(
      tap(result => {
        if (
          this.store.hasRole(['moderator', 'admin', 'superuser']) === false &&
          this.store.checkUserReference(result.metadata.user.$ref) === false
        ) {
          throw new Error('Logged user is not owning this deposit');
        }
      })
    );
  }

  create(): Observable<{ metadata: Deposit; [key: string]: unknown }> {
    return this.httpClient.post<{ metadata: Deposit; [key: string]: unknown }>(`${this.apiService.getEndpointByType('deposits', true)}/`, {
      user: {
        $ref: this.store.getUserRefEndpoint()
      },
      step: 'metadata',
      status: 'in_progress'
    });
  }

  update(id: string, data: Record<string, unknown>): Observable<{ metadata: Deposit; [key: string]: unknown } | null> {
    data = removeEmptyValues(data);
    return this.httpClient
      .put<{ metadata: Deposit; [key: string]: unknown }>(`${this.apiService.getEndpointByType('deposits', true)}/${id}`, data)
      .pipe(
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(error.error.message),
            sticky: true,
            closable: true,
          });
          return of(null);
        })
      );
  }

  delete(deposit: Deposit): Observable<unknown> {
    let deleteFileObservable$ = of(null);
    if (deposit._files) {
      deleteFileObservable$ = from(deposit._files).pipe(
        mergeMap((file: DepositFile) => this.removeFile(deposit.pid, file.key, file.version_id)),
        ignoreElements()
      );
    }
    return concat(
      deleteFileObservable$,
      this.httpClient.delete(`${this.apiService.getEndpointByType('deposits', true)}/${deposit.pid}`)
    ).pipe(reduce(() => true));
  }

  publish(id: string): Observable<unknown> {
    return this.httpClient
      .post(`${this.depositEndPoint}/${id}/publish`, null)
      .pipe(catchError(err => this._handleError(err)));
  }

  removeFile(id: string, name: string, versionId: string | null = null): Observable<unknown> {
    return this.httpClient
      .delete(
        `${this.apiService.getEndpointByType('deposits', true)}/${id}/files/${name}${
          versionId ? '?versionId=' + versionId : ''
        }`
      )
      .pipe(catchError(() => of(null)));
  }

  getJsonSchema(type: string): Observable<object> {
    return this.recordService.getSchemaForm(type).pipe(
      map((result: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = result as any;
        r.schema = processJsonSchema(resolve$ref(r.schema, r.schema.properties));
        return r.schema;
      })
    );
  }

  reviewDeposit(deposit: Deposit, action: string, comment: string | null = null): Observable<unknown> {
    return this.httpClient
      .post(`${this.depositEndPoint}/${deposit.pid}/review`, {
        action,
        user: { $ref: this.store.getUserRefEndpoint() },
        comment: comment || null
      })
      .pipe(catchError(err => this._handleError(err)));
  }

  extractPDFMetadata(deposit: Deposit): Observable<Record<string, unknown>> {
    return this.httpClient
      .get<Record<string, unknown>>(`${this.depositEndPoint}/${deposit.pid}/extract-pdf-metadata`)
      .pipe(catchError(err => this._handleError(err)));
  }

  private _handleError(error: HttpErrorResponse) {
    this.messageService.add({
      severity: 'error',
      detail: this.translateService.instant(error.message),
      sticky: true,
      closable: true,
    });
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
