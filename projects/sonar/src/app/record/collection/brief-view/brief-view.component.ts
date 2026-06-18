// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetailUrl, RecordData } from '@rero/ng-core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { LanguageValuePipe } from '../../../pipe/language-value.pipe';

@Component({
    templateUrl: './brief-view.component.html',
    imports: [RouterLink, AsyncPipe, LanguageValuePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BriefViewComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();
}
