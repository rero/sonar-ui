/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
