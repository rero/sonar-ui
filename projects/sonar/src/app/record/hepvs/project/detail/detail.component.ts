// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
