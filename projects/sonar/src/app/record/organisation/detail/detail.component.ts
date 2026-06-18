// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RecordData, RecordService, MarkdownPipe, Nl2brPipe, UpperCaseFirstPipe } from '@rero/ng-core';
import { combineLatest } from 'rxjs';
import { FieldDescriptionComponent } from '../../../core/field-description/field-description.component';
import { PrimeTemplate } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { UploadFilesComponent } from '../../files/upload-files/upload-files.component';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageValuePipe } from '../../../pipe/language-value.pipe';

@Component({
    templateUrl: './detail.component.html',
    imports: [FieldDescriptionComponent, PrimeTemplate, RouterLink, UploadFilesComponent, AsyncPipe, TranslatePipe, MarkdownPipe, Nl2brPipe, UpperCaseFirstPipe, LanguageValuePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent {

  private recordService: RecordService = inject(RecordService);

  record = input.required<RecordData>();

  /** Type of resource. */
  type = input<string>();

  /** Subdivisions list. */
  subdivisions = signal<unknown[]>([]);

  /** Collections list. */
  collections = signal<unknown[]>([]);

  constructor() {
    effect(() => {
      const record = this.record();
      if (!record) return;
      combineLatest([
        this.recordService.getRecords('subdivisions', { query: `organisation.pid:${record.id}` }),
        this.recordService.getRecords('collections', { query: `organisation.pid:${record.id}` }),
      ]).subscribe((results: { hits: { hits: unknown[] } }[]) => {
        this.subdivisions.set(results[0].hits.hits);
        this.collections.set(results[1].hits.hits);
      });
    });
  }
}
