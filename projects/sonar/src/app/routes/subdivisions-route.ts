// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { EditorComponent, RecordData, RecordSearchPageComponent, RecordType } from '@rero/ng-core';
import { of } from 'rxjs';
import { roleGuard } from '../guard/role.guard';
import { BriefViewComponent as SubdivisionBriefViewComponent } from '../record/subdivision/brief-view/brief-view.component';
import { typeResolver } from './type-resolver';
import { RouteToolService } from './route-tool.service';

export const subdivisionsRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);

  return [{
    key: 'subdivisions',
    label: 'Subdivisions',
    component: SubdivisionBriefViewComponent,
    redirectUrl: (record: RecordData) => of(`/records/subdivisions?q=pid:${record.metadata['pid']}`),
    aggregationsBucketSize: 10,
    showFacetsIfNoResults: true,
    exportFormats: [],
    sortOptions: [
      { label: _('Relevance'), value: 'relevance', icon: 'fa fa-sort-amount-desc', defaultQuery: true },
      { label: _('Name'), value: 'name', icon: 'fa fa-sort-alpha-asc', defaultNoQuery: true },
    ],
    canAdd: () => routeToolService.canAccess('subdivisions', 'add'),
    canUpdate: (record: RecordData) => routeToolService.canAccess('subdivisions', 'update', record),
    canDelete: (record: RecordData) => routeToolService.canAccess('subdivisions', 'delete', record),
    canRead: (record: RecordData) => routeToolService.canAccess('subdivisions', 'read', record),
  }];
};

export const subdivisionsRoutes: Routes = [
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
];
