// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Routes } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { RecordSearchPageComponent } from '@rero/ng-core';

import { ConfirmationComponent } from '../deposit/confirmation/confirmation.component';
import { DepositStore } from '../deposit/deposit.store';
import { MetadataComponent } from '../deposit/metadata/metadata.component';
import { UploadComponent } from '../deposit/upload/upload.component';
import { roleGuard } from '../guard/role.guard';
import { sonarFormlyProviders } from './formly.providers';
import { typeResolver } from './type-resolver';

export const depositsRecordRoutes: Routes = [
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
    ],
  },
];

export const depositsRoutes: Routes = [
  {
    path: '',
    providers: sonarFormlyProviders,
    children: [
      {
        path: 'create',
        title: _('Deposit'),
        canActivate: [roleGuard],
        component: UploadComponent,
        providers: [DepositStore],
        data: { mode: 'create' },
      },
      {
        path: ':id',
        title: _('Deposit'),
        canActivate: [roleGuard],
        providers: [DepositStore],
        data: { role: 'submitter' },
        children: [
          { path: 'files', title: _('Deposit'), component: UploadComponent },
          { path: 'confirmation', title: _('Deposit'), component: ConfirmationComponent },
          { path: ':step', title: _('Deposit'), component: MetadataComponent },
        ],
      },
    ],
  },
];
