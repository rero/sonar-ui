// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetailUrl, RecordData } from '@rero/ng-core';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageValuePipe } from '../../pipe/language-value.pipe';

@Component({
    templateUrl: './user.component.html',
    imports: [Bind, Tag, AsyncPipe, TranslatePipe, LanguageValuePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();
}
