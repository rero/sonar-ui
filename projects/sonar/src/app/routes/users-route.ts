// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { EditorComponent, RecordData, RecordSearchPageComponent, RecordType } from '@rero/ng-core';
import { of } from 'rxjs';
import { roleGuard } from '../guard/role.guard';
import { UserComponent } from '../record/user/user.component';
import { typeResolver } from './type-resolver';
import { RouteToolService } from './route-tool.service';

export const usersRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);

  return [{
    key: 'users',
    label: 'Users',
    component: UserComponent,
    aggregationsOrder: ['subdivision'],
    redirectUrl: (record: RecordData) => of(`/records/users?q=pid:${record.metadata['pid']}`),
    sortOptions: [
      { label: _('Relevance'), value: 'relevance', icon: 'fa fa-sort-amount-desc', defaultQuery: true },
      { label: _('Name'), value: 'name', icon: 'fa fa-sort-alpha-asc', defaultNoQuery: true },
    ],
    aggregationsBucketSize: 10,
    showFacetsIfNoResults: true,
    exportFormats: [],
    canAdd: () => routeToolService.canAccess('users', 'add'),
    canUpdate: (record: RecordData) => routeToolService.canAccess('users', 'update', record),
    canDelete: (record: RecordData) => routeToolService.canAccess('users', 'delete', record),
    canRead: (record: RecordData) => routeToolService.canAccess('users', 'read', record),
  }];
};

export const usersRoutes: Routes = [
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
];
