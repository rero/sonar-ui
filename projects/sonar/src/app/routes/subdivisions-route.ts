// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Routes } from '@angular/router';
import { RecordSearchPageComponent } from '@rero/ng-core';
import { EditorComponent } from '@rero/ng-core/editor';

import { roleGuard } from '../guard/role.guard';
import { sonarFormlyProviders } from './formly.providers';
import { typeResolver } from './type-resolver';

export const subdivisionsRoutes: Routes = [
  {
    path: '',
    providers: sonarFormlyProviders,
    children: [
      {
        path: '',
        title: typeResolver,
        component: RecordSearchPageComponent,
        canActivate: [roleGuard],
        data: { role: 'submitter', showSearchInput: true },
      },
      {
        path: 'edit/:pid',
        title: typeResolver,
        component: EditorComponent,
        canActivate: [roleGuard],
        data: { role: 'submitter' },
      },
      {
        path: 'new',
        title: typeResolver,
        component: EditorComponent,
        canActivate: [roleGuard],
        data: { role: 'submitter' },
      },
    ],
  },
];
