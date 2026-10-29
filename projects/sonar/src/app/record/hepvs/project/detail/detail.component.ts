// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AsyncPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Bind } from '@openng/optimus-ui/bind';
import { Tag } from '@openng/optimus-ui/tag';
import { DateTranslatePipe, ReadMoreComponent } from '@rero/ng-core';

import { FieldDescriptionComponent } from '../../../../core/field-description/field-description.component';
import { JoinPipe } from '../../../../core/join.pipe';
import { LanguageValuePipe } from '../../../../pipe/language-value.pipe';
import { DetailComponent as BaseProjectDetailComponent } from '../../../project/detail/detail.component';
import { ValidationComponent } from '../../../validation/validation.component';

@Component({
  templateUrl: './detail.component.html',
  imports: [
    ValidationComponent,
    Bind,
    Tag,
    FieldDescriptionComponent,
    PrimeTemplate,
    ReadMoreComponent,
    NgClass,
    RouterLink,
    AsyncPipe,
    TranslatePipe,
    DateTranslatePipe,
    JoinPipe,
    LanguageValuePipe,
  ],
})
export class DetailComponent extends BaseProjectDetailComponent {}
