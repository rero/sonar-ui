// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { Tag } from '@openng/optimus-ui/tag';
import { DetailUrl, RecordData } from '@rero/ng-core';

import { LanguageValuePipe } from '../../pipe/language-value.pipe';

@Component({
  templateUrl: './user.component.html',
  imports: [Bind, Tag, AsyncPipe, TranslatePipe, LanguageValuePipe],
})
export class UserComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();
}
