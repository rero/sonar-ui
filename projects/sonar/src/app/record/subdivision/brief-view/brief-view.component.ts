// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { DetailUrl, RecordData } from '@rero/ng-core';

import { LanguageValuePipe } from '../../../pipe/language-value.pipe';

@Component({
  templateUrl: './brief-view.component.html',
  imports: [AsyncPipe, LanguageValuePipe],
})
export class BriefViewComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();
}
