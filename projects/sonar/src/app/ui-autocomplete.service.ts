// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService, RecordService } from '@rero/ng-core';
import type { IQueryOptions, ISuggestionItem } from '@rero/ng-core';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UIAutocompleteService {

  private httpClient: HttpClient = inject(HttpClient);
  private translateService: TranslateService = inject(TranslateService);
  private apiService: ApiService = inject(ApiService);
  private recordService: RecordService = inject(RecordService);

  public getSuggestions(query: string, queryOptions: IQueryOptions = {}, _currentPid: string): Observable<ISuggestionItem[]> {
    if (!query) {
      return of([]);
    }
    let url = `/api/${queryOptions.type}/?q=${queryOptions.field}:${query}`;
    if (queryOptions.suggest) {
      url = `${queryOptions.suggest}?resource=${queryOptions.type}&field=${queryOptions.field}&q=${query}`;
    }
    return this.httpClient.get<{ hits?: { hits: { id: string; metadata: Record<string, unknown> }[] } } | string[]>(url).pipe(
        map((results) => {
          let toReturn: ISuggestionItem[] = [];
          if ('hits' in results && results.hits) {
            toReturn = results.hits.hits.map((hit) => {
              return {
                label: hit.metadata[queryOptions.label] as string,
                value: this.apiService.getRefEndpoint(queryOptions.type, hit.id)
              };
            });
          } else if (Array.isArray(results)) {
            toReturn = (results as string[]).map((hit) => {
            return {
              label: hit,
             value: hit
            };
          });
          }
          if(queryOptions.allowAdd == true && (!Array.isArray(results) || results.length === 0)) {
            const label = `<span>${this.translateService.instant("New")}:</span>&nbsp;${query}`;
            toReturn.push({label: label, value: query});
          }
          return toReturn;

        }),
        catchError(e => {
          switch (e.status) {
            case 400:
              return [];
            default:
              throw e;
          }
        })
      );
  }

  getValueAsHTML(queryOptions: IQueryOptions, item: ISuggestionItem): Observable<string> {
    const url = item.value.split('/');
    if(url.length < 2) {
      return of(this.formatValue(item.value));
    }
    const pid = url.pop();
    return this.recordService
      .getRecord(queryOptions.type, pid, { resolve: 1 })
      .pipe(
        map((data: { metadata: Record<string, unknown> }) => this.formatValue(data.metadata[queryOptions.label] as string))
      );
  }

  private formatValue(value:string): string {
    return `<span class="ui:p-2"><strong>${value}</strong></span>`;
  }
}
