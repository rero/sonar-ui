/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { ApiService, DetailComponent, EditorComponent, RecordData, RecordSearchPageComponent, RecordType } from '@rero/ng-core';
import { canAddGuard } from '../guard/can-add.guard';
import { roleGuard } from '../guard/role.guard';
import { DetailComponent as HepvsProjectDetailComponent } from '../record/hepvs/project/detail/detail.component';
import { BriefViewComponent as ProjectBriefViewComponent } from '../record/project/brief-view/brief-view.component';
import { DetailComponent as ProjectDetailComponent } from '../record/project/detail/detail.component';
import { typeResolver } from './type-resolver';
import { AppStore, AppStoreType } from '../store/app.store';
import type { AppState } from '../store/app.store';
import { RouteToolService } from './route-tool.service';

export const projectsRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);
  const apiService = inject(ApiService);
  const store = inject(AppStore) as AppStoreType;
  const user = store.user();
  const organisation = store.organisation() as AppState['organisation'];
  const organisationCode = organisation?.code;

  const detailComponent = organisationCode === 'hepvs'
    ? HepvsProjectDetailComponent
    : ProjectDetailComponent;

  return [{
    key: 'projects',
    label: 'Research projects',
    component: ProjectBriefViewComponent,
    detailComponent,
    recordResource: true,
    aggregationsExpand: ['organisation', 'user'],
    aggregationsOrder: ['organisation', 'user', 'status'],
    aggregationsBucketSize: 10,
    showFacetsIfNoResults: true,
    editorSettings: { longMode: true },
    preCreateRecord: ((record: RecordData) => {
      const organisationCode = organisation?.code;
      if (organisationCode) {
        (record.metadata as Record<string, unknown>)['organisation'] = {
          $ref: apiService.getRefEndpoint('organisations', organisationCode),
        };
      }
      const userPid = user?.pid;
      if (userPid) {
        (record.metadata as Record<string, unknown>)['user'] = {
          $ref: apiService.getRefEndpoint('users', userPid),
        };
      }
      return record;
    }) as any,
    exportFormats: [{ label: 'CSV', format: 'text/csv' }] as any,
    sortOptions: [
      { label: _('Relevance'), value: 'relevance', icon: 'fa fa-sort-amount-desc', defaultQuery: true },
      { label: _('Name'), value: 'name', icon: 'fa fa-sort-alpha-asc', defaultNoQuery: true },
      { label: _('Date descending'), icon: 'fa fa-sort-amount-desc', value: 'newest' },
      { label: _('Date ascending'), icon: 'fa fa-sort-amount-asc', value: 'oldest' },
    ],
    canAdd: () => routeToolService.canAccess('projects', 'add'),
    canUpdate: (record: RecordData) => routeToolService.canAccess('projects', 'update', record),
    canDelete: (record: RecordData) => routeToolService.canAccess('projects', 'delete', record),
    canRead: (record: RecordData) => routeToolService.canAccess('projects', 'read', record),
  }];
};

export const projectsRoutes: Routes = [
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
    canActivate: [roleGuard, canAddGuard],
    data: { role: 'submitter' },
  },
  {
    path: 'detail/:pid',
    title: typeResolver,
    component: DetailComponent,
    canActivate: [roleGuard],
    data: { role: 'submitter' },
  },
];
