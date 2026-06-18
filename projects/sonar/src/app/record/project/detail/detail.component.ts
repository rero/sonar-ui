// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RecordData } from '@rero/ng-core';
import { AppStore, AppStoreType } from '../../../store/app.store';
import { FieldDescriptionComponent } from '../../../core/field-description/field-description.component';
import { PrimeTemplate } from 'primeng/api';
import { IdentifierComponent } from '../../identifier/identifier.component';
import { Tooltip } from 'primeng/tooltip';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { DateTranslatePipe, Nl2brPipe } from '@rero/ng-core';
import { JoinPipe } from '../../../core/join.pipe';
import { LanguageValuePipe } from '../../../pipe/language-value.pipe';

@Component({
    templateUrl: './detail.component.html',
    imports: [FieldDescriptionComponent, PrimeTemplate, IdentifierComponent, Tooltip, TranslateDirective, RouterLink, AsyncPipe, TranslatePipe, DateTranslatePipe, Nl2brPipe, JoinPipe, LanguageValuePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent {

  private store = inject(AppStore) as AppStoreType;

  record = input.required<RecordData>();
  type = input.required<string>();

  user = this.store.user;
}
