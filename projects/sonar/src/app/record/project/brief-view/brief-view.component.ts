// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetailUrl, DateTranslatePipe, RecordData } from '@rero/ng-core';
import { VALIDATION_STATUS_SEVERITY } from '../../../enum/validation';
import { TagSeverity } from '../../../type/tagSeverityType';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './brief-view.component.html',
    imports: [RouterLink, Bind, Tag, TranslatePipe, DateTranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BriefViewComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();

  get validationSeverity(): TagSeverity {
    const meta = this.record()?.metadata as Record<string, unknown>;
    const validation = meta?.validation as Record<string, unknown>;
    const severity = validation?.status
      ? VALIDATION_STATUS_SEVERITY[validation.status as string]
      : null;
    return severity as TagSeverity;
  }
}
