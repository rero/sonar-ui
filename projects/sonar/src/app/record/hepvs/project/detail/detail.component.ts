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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DetailComponent as BaseProjectDetailComponent } from '../../../project/detail/detail.component';
import { ValidationComponent } from '../../../validation/validation.component';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { FieldDescriptionComponent } from '../../../../core/field-description/field-description.component';
import { PrimeTemplate } from 'primeng/api';
import { ReadMoreComponent, DateTranslatePipe } from '@rero/ng-core';
import { NgClass, AsyncPipe } from '@angular/common';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { JoinPipe } from '../../../../core/join.pipe';
import { LanguageValuePipe } from '../../../../pipe/language-value.pipe';

@Component({
    templateUrl: './detail.component.html',
    imports: [ValidationComponent, Bind, Tag, FieldDescriptionComponent, PrimeTemplate, ReadMoreComponent, NgClass, TranslateDirective, RouterLink, AsyncPipe, TranslatePipe, DateTranslatePipe, JoinPipe, LanguageValuePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent extends BaseProjectDetailComponent {}
