// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { DateTranslatePipe, Nl2brPipe, RecordData } from '@rero/ng-core';

import { FieldDescriptionComponent } from '../../../core/field-description/field-description.component';
import { JoinPipe } from '../../../core/join.pipe';
import { LanguageValuePipe } from '../../../pipe/language-value.pipe';
import { AppStore, AppStoreType } from '../../../store/app.store';
import { IdentifierComponent } from '../../identifier/identifier.component';

@Component({
  templateUrl: './detail.component.html',
  imports: [
    FieldDescriptionComponent,
    PrimeTemplate,
    IdentifierComponent,
    Tooltip,
    RouterLink,
    AsyncPipe,
    TranslatePipe,
    DateTranslatePipe,
    Nl2brPipe,
    JoinPipe,
    LanguageValuePipe,
  ],
})
export class DetailComponent {
  private store = inject(AppStore) as AppStoreType;

  record = input.required<RecordData>();
  type = input.required<string>();

  user = this.store.user;
}
