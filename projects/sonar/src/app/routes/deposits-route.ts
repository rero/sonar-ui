// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { DepositStore } from '../deposit/deposit.store';
import { _ } from '@ngx-translate/core';
import { RecordData, RecordSearchPageComponent, RecordType } from '@rero/ng-core';
import { of } from 'rxjs';
import { roleGuard } from '../guard/role.guard';
import { BriefViewComponent } from '../deposit/brief-view/brief-view.component';
import { ConfirmationComponent } from '../deposit/confirmation/confirmation.component';
import { MetadataComponent } from '../deposit/metadata/metadata.component';
import { UploadComponent } from '../deposit/upload/upload.component';
import { AggregationFilter } from '../record/document/aggregation-filter';
import { typeResolver } from './type-resolver';
import { RouteToolService } from './route-tool.service';

export const depositsRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);

  return [{
    key: 'deposits',
    label: 'Deposits',
    component: BriefViewComponent,
    aggregations: AggregationFilter.filter,
    aggregationsExpand: ['status', 'user', 'contributor'],
    aggregationsOrder: ['status', 'user', 'contributor', 'subdivision'],
    aggregationsBucketSize: 10,
    showFacetsIfNoResults: true,
    exportFormats: [],
    sortOptions: [
      { label: _('Relevance'), value: 'relevance', icon: 'fa-solid fa-arrow-down-wide-short', defaultQuery: true },
      { label: _('Date descending'), value: 'newest', icon: 'fa-solid fa-arrow-down-wide-short', defaultNoQuery: true },
      { label: _('Date ascending'), value: 'oldest', icon: 'fa-solid fa-arrow-down-short-wide' },
    ],
    canAdd: () => of({ can: false, message: '' }),
    canUpdate: () => of({ can: false, message: '' }),
    canDelete: (record: RecordData) => routeToolService.canAccess('deposits', 'delete', record),
    canRead: (record: RecordData) => routeToolService.canAccess('deposits', 'read', record),
  }];
};

export const depositsRecordRoutes: Routes = [
  {
    path: '',
    title: typeResolver,
    component: RecordSearchPageComponent,
    canActivate: [roleGuard],
    data: { role: 'submitter', showSearchInput: true },
  },
];

export const depositsRoutes: Routes = [
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
];
