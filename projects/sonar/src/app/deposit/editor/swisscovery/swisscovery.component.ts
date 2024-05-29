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

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { map } from 'rxjs';

@Component({
  selector: 'sonar-deposit-editor-swisscovery',
  templateUrl: './swisscovery.component.html',
  standalone: false,
})
export class SwisscoveryComponent {

  private spinner: NgxSpinnerService = inject(NgxSpinnerService);
  private apiService: ApiService = inject(ApiService);
  private httpClient: HttpClient = inject(HttpClient);
  private translateService: TranslateService = inject(TranslateService);

  /** Swisscovery result */
  scResult: any = null;
  data = output<any>();
  types = [];
  searchTerms = '';
  scType = {
    name: 'Everywhere',
    code: 'all_for_ui',
  };

  constructor() {
    this.types = [
      {
        name: this.translateService.instant('Everywhere'),
        code: 'all_for_ui',
      },
      {
        name: this.translateService.instant('DOI'),
        code: 'digital_object_identifier',
      },
      {
        name: this.translateService.instant('ID swisscovery (MARC 001)'),
        code: 'mms_id',
      },
      {
        name: this.translateService.instant('ISBN'),
        code: 'isbn',
      },
      {
        name: this.translateService.instant('ISSN'),
        code: 'issn',
      },
    ];
  }
  /**
   * Search record in swisscovery
   *
   * @returns void
   */
  searchSwisscovery(): void {
    if (!this.searchTerms) {
      return;
    }

    this.spinner.show();

    const params = new HttpParams()
      .set('type', this.scType.code)
      .set('query', this.searchTerms)
      .set('format', 'deposit');

    this.httpClient
      .get(`${this.apiService.getEndpointByType('swisscovery', true)}/`, {
        params,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) =>
          response.status === 200 ? response.body : null
        )
      )
      .subscribe((data) => {
        if (data === null) {
          this.scResult = null;
        }
        let result: any = {};
        if (data?.metadata) {
          result.metadata = data.metadata;
        }
        if (data?.contributors) {
          result.contributors = data.contributors
            .map((res) => res.name)
            .join(', ');
        }
        this.scResult = result;

        this.spinner.hide();
      });
  }
  /**
   * Check if a result exists for a swisscovery search.
   *
   * @returns True if a search is done and a result is found.
   */
  get hasSwisscoveryResult(): boolean {
    return this.scResult && Object.keys(this.scResult).length > 0;
  }

  save() {
    this.data.emit(this.scResult);
  }
}
