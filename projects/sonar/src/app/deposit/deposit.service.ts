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
import { inject, Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService, processJsonSchema, RecordService, removeEmptyValues, resolve$ref } from '@rero/ng-core';
import { MessageService } from 'primeng/api';
import { concat, from, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, ignoreElements, map, mergeMap, reduce, tap } from 'rxjs/operators';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class DepositService implements OnDestroy {

  private apiService: ApiService = inject(ApiService);
  private httpClient: HttpClient = inject(HttpClient);
  private userService: UserService = inject(UserService);
  private messageService: MessageService = inject(MessageService);
  private translateService: TranslateService = inject(TranslateService);
  private recordService: RecordService = inject(RecordService);

  // Logged user
  private user: any;

  // User subscription
  private subscription: Subscription = new Subscription();

  constructor() {
    this.subscription.add(this.userService.user$.subscribe((user) => {
      this.user = user;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Returns deposit endpoint.
   *
   * @return Deposit endpoint as string.
   */
  get depositEndPoint(): string {
    return `${this.apiService.getEndpointByType('deposits', true)}`;
  }

  /**
   * Get the deposit corresponding to given ID.
   * @param id - string ID of deposit
   */
  get(id: string): Observable<any> {
    return this.httpClient.get(`${this.apiService.getEndpointByType('deposits', true)}/${id}`).pipe(
      tap(result => {
        if (
          this.userService.hasRole(['moderator', 'admin', 'superuser']) === false &&
          this.userService.checkUserReference(result.metadata.user.$ref) === false
        ) {
          throw new Error('Logged user is not owning this deposit');
        }
      })
    );
  }

  /**
   * Create a deposit
   */
  create(): Observable<any> {
    return this.httpClient.post(`${this.apiService.getEndpointByType('deposits', true)}/`, {
      user: {
        $ref: this.userService.getUserRefEndpoint()
      },
      step: 'metadata',
      status: 'in_progress'
    });
  }

  /**
   * Update the deposit corresponding to given ID.
   * @param id ID of deposit
   * @param data Deposit metadata
   */
  update(id: string, data: any): Observable<any> {
    // Clean up empty values before sending the form.
    data = removeEmptyValues(data);

    return this.httpClient
      .put(`${this.apiService.getEndpointByType('deposits', true)}/${id}`, data)
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

  /**
   * Remove a deposit and all files linked to it.
   * @param deposit Deposit to remove
   */
  delete(deposit: any): Observable<any> {
    let deleteFileObservable$ = of(null);

    if (deposit._files) {
      deleteFileObservable$ = from(deposit._files).pipe(
        mergeMap((file: any) => {
          return this.removeFile(deposit.pid, file.key, file.version_id);
        }),
        ignoreElements()
      );
    }

    return concat(
      deleteFileObservable$,
      this.httpClient.delete(
        `${this.apiService.getEndpointByType('deposits', true)}/${deposit.pid}`
      )
    ).pipe(reduce(() => true));
  }

  /**
   * Publish a deposit
   * @param id Deposit ID to publish
   */
  publish(id: string): Observable<any> {
    return this.httpClient
      .post(`${this.depositEndPoint}/${id}/publish`, null)
      .pipe(catchError(err => this._handleError(err)));
  }

  /**
   * Remove file from bucket
   * @param id Deposit id
   * @param name File key
   * @param versionId File version, if specified, will make a hard delete of the file. See invenio-files-rest for detail.
   */
  removeFile(id: string, name: string, versionId: string = null): Observable<any> {
    return this.httpClient
      .delete(
        `${this.apiService.getEndpointByType('deposits', true)}/${id}/files/${name}${
        versionId ? '?versionId=' + versionId : ''
        }`
      )
      .pipe(catchError(() => of(null)));
  }

  /**
   * Return the JSON schema corresponding to resource, with properties ordered.
   * @param type Resource type
   */
  getJsonSchema(type: string): Observable<any> {
    return this.recordService.getSchemaForm(type)
      .pipe(
        map((result: any) => {
          result.schema = processJsonSchema(resolve$ref(result.schema, result.schema.properties));
          return result.schema;
        })
      );
  }

  /**
   * Check if user can access to deposit
   * @param deposit Deposit to check
   */
  canAccessDeposit(deposit: any): boolean {
    if (
      (deposit.status === 'in_progress' || deposit.status === 'ask_for_changes') &&
      this.userService.checkUserReference(deposit.user.$ref)
    ) {
      return true;
    }

    if (deposit.status === 'to_validate' && this.user && this.user.is_moderator) {
      return true;
    }

    return false;
  }

  /**
   * Review a deposit by calling an API endpoint depending on given action.
   * @param deposit Deposit to review
   * @param action Action to send to API
   */
  reviewDeposit(deposit: any, action: string, comment: string = null): Observable<any> {
    return this.httpClient
      .post(`${this.depositEndPoint}/${deposit.pid}/review`, {
        action,
        user: {
          $ref: this.userService.getUserRefEndpoint()
        },
        comment: comment || null
      })
      .pipe(catchError(err => this._handleError(err)));
  }

  /**
   * Get the extracted metadata from main file.
   * @param deposit Deposit
   */
  extractPDFMetadata(deposit: any): Observable<any> {
    return this.httpClient
      .get(`${this.depositEndPoint}/${deposit.pid}/extract-pdf-metadata`)
      .pipe(
        catchError(err => this._handleError(err))
      );
  }

  /**
   * Error handling during api call process.
   * @param error - HttpErrorResponse
   */
  private _handleError(error: HttpErrorResponse) {
    this.messageService.add({
      severity: 'error',
      detail: this.translateService.instant(error.statusText),
      sticky: true,
      closable: true,
    });
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
