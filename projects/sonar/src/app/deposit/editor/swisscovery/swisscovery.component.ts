// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { finalize, map } from 'rxjs';

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
  private messageService = inject(MessageService);

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
        ),
        finalize(() => this.spinner.hide())
      )
      .subscribe({
        next: (data) => {
          if (data === null) {
            this.scResult.set(null);
          } else {
            const result: ScResult = {};
            if (data.metadata) { result.metadata = data.metadata; }
            if (data.contributors) { result.contributors = data.contributors; }
            this.scResult.set(result);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.scResult.set(null);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('Error'),
            detail: this.translateService.instant('Your request to the external server has failed. Try again later ({{ statusCode }})', { statusCode: err.status }),
            sticky: true,
            closable: true,
          });
        },
      });
  }

  save() {
    this.data.emit(this.scResult());
  }
}
