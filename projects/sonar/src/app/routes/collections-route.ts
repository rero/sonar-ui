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
import { DetailComponent, EditorComponent, File as NgCoreFile, RecordData, RecordSearchPageComponent, RecordType } from '@rero/ng-core';
import { of } from 'rxjs';
import { canAddGuard } from '../guard/can-add.guard';
import { roleGuard } from '../guard/role.guard';
import { DetailComponent as CollectionDetailComponent } from '../record/collection/detail/detail.component';
import { BriefViewComponent as CollectionBriefViewComponent } from '../record/collection/brief-view/brief-view.component';
import { typeResolver } from './type-resolver';
import { RouteToolService } from './route-tool.service';

const fileConfig = {
  enabled: true,
  orderList: (a: NgCoreFile, b: NgCoreFile) => (a.metadata?.order ?? 0) - (b.metadata?.order ?? 0),
  infoExcludedFields: ['restriction', 'type', 'links', 'thumbnail', 'permissions'],
  canAdd: () => of({ can: true, message: '' }),
  canRead: (_record: RecordData, file: NgCoreFile) =>
    of({ can: file?.metadata?.permissions?.read ?? false, message: '' }),
  canUpdateMetadata: (_record: RecordData, file: NgCoreFile) =>
    of({ can: file?.metadata?.permissions?.update ?? false, message: '' }),
  canUpdate: (_record: RecordData, file: NgCoreFile) =>
    of({ can: file?.metadata?.permissions?.update ?? false, message: '' }),
  canDelete: (_record: RecordData, file: NgCoreFile) =>
    of({ can: file?.metadata?.permissions?.delete ?? false, message: '' }),
};

export const collectionsRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);

  return [{
    key: 'collections',
    label: 'Collections',
    component: CollectionBriefViewComponent,
    detailComponent: CollectionDetailComponent,
    files: fileConfig,
    aggregationsBucketSize: 10,
    showFacetsIfNoResults: true,
    exportFormats: [],
    sortOptions: [
      { label: _('Relevance'), value: 'relevance', icon: 'fa fa-sort-amount-desc', defaultQuery: true },
      { label: _('Name'), value: 'name', icon: 'fa fa-sort-alpha-asc', defaultNoQuery: true },
    ],
    canAdd: () => routeToolService.canAccess('collections', 'add'),
    canUpdate: (record: RecordData) => routeToolService.canAccess('collections', 'update', record),
    canDelete: (record: RecordData) => routeToolService.canAccess('collections', 'delete', record),
    canRead: (record: RecordData) => routeToolService.canAccess('collections', 'read', record),
  }];
};

export const collectionsRoutes: Routes = [
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
