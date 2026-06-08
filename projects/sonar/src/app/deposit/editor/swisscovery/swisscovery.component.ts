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

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { map } from 'rxjs';

type ScType = { name: string; code: string };
type ScResult = { metadata?: { title?: string }; contributors?: { name: string }[] };

@Component({
    selector: 'sonar-deposit-editor-swisscovery',
    templateUrl: './swisscovery.component.html',
    imports: [
        Bind,
        Select,
        ReactiveFormsModule,
        FormsModule,
        InputGroup,
        InputText,
        InputGroupAddon,
        Button,
        TranslateDirective,
        Message,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwisscoveryComponent {

  private spinner = inject(NgxSpinnerService);
  private apiService = inject(ApiService);
  private httpClient = inject(HttpClient);
  private translateService = inject(TranslateService);

  data = output<ScResult | null>();

  types = signal<ScType[]>([
    { name: this.translateService.instant('Everywhere'), code: 'all_for_ui' },
    { name: this.translateService.instant('DOI'), code: 'digital_object_identifier' },
    { name: this.translateService.instant('ID swisscovery (MARC 001)'), code: 'mms_id' },
    { name: this.translateService.instant('ISBN'), code: 'isbn' },
    { name: this.translateService.instant('ISSN'), code: 'issn' },
  ]);

  searchTerms = signal('');
  scType = signal<ScType>(this.types()[0]);
  scResult = signal<ScResult | null>(null);

  hasSwisscoveryResult = computed(() => {
    const result = this.scResult();
    return result !== null && Object.keys(result).length > 0;
  });
  /**
   * Search record in swisscovery
   *
   * @returns void
   */
  searchSwisscovery(): void {
    if (!this.searchTerms()) {
      return;
    }

    this.spinner.show();

    const params = new HttpParams()
      .set('type', this.scType().code)
      .set('query', this.searchTerms())
      .set('format', 'deposit');

    this.httpClient
      .get(`${this.apiService.getEndpointByType('swisscovery', true)}/`, {
        params,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<ScResult>) =>
          response.status === 200 ? response.body : null
        )
      )
      .subscribe((data) => {
        if (data === null) {
          this.scResult.set(null);
        } else {
          const result: ScResult = {};
          if (data.metadata) { result.metadata = data.metadata; }
          if (data.contributors) { result.contributors = data.contributors; }
          this.scResult.set(result);
        }

        this.spinner.hide();
      });
  }

  save() {
    this.data.emit(this.scResult());
  }
}
