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
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@ngx-translate/core';
import { ApiService, Bucket, DetailComponent, EditorComponent, File as NgCoreFile, RecordData, RecordSearchPageComponent, RecordType } from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { canAddGuard } from '../guard/can-add.guard';
import { roleGuard } from '../guard/role.guard';
import { AggregationFilter } from '../record/document/aggregation-filter';
import { DetailComponent as DocumentDetailComponent } from '../record/document/detail/detail.component';
import { DocumentComponent } from '../record/document/document.component';
import { typeResolver } from './type-resolver';
import { BucketNameService } from '../bucket-name.service';
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

export function fetchAggregationsOrder(route: ActivatedRouteSnapshot): Observable<string[]> {
  const apiService = inject(ApiService);
  const httpClient = inject(HttpClient);
  let params = new HttpParams();
  const view = route.params['view'];
  if (view) {
    params = params.set('view', view);
  }
  if (route.queryParams['collection_view']) {
    params = params.set('collection', '1');
  }
  return httpClient.get<(string | { key: string; name: string })[]>(
    `${apiService.getEndpointByType('documents', true)}/aggregations`,
    { params }
  ).pipe(
    map((items) => items.map((item) => typeof item === 'string' ? item : item.key))
  );
}

export const documentsRouteResolver: ResolveFn<Partial<RecordType>[]> = (route: ActivatedRouteSnapshot) => {
  const translateService = inject(TranslateService);
  const routeToolService = inject(RouteToolService);
  const bucketNameService = inject(BucketNameService);

  AggregationFilter.translateService = translateService;

  return fetchAggregationsOrder(route).pipe(
    map((aggregationsOrder) => [{
      key: 'documents',
      label: 'Documents',
      component: DocumentComponent,
      detailComponent: DocumentDetailComponent,
      aggregations: AggregationFilter.filter,
      aggregationsExpand: ['document_type', 'controlled_affiliation', 'year'],
      aggregationsOrder,
      processBucketName: (bucket: Bucket) => bucketNameService.transform(bucket),
      aggregationsBucketSize: 10,
      editorSettings: { longMode: true, getHeaders: { Accept: 'application/rero+json' } },
      files: {
        ...fileConfig,
        filterList: (item: NgCoreFile) => item.metadata?.type === 'file',
      },
      searchFields: [{ label: _('Search in full-text'), path: 'fulltext' }],
      searchFilters: [{ label: _('Open access'), filter: 'open_access', value: 'true' }],
      showFacetsIfNoResults: true,
      exportFormats: [],
      sortOptions: [
      { label: _('Relevance'), value: 'relevance', icon: 'fa fa-sort-amount-desc', defaultQuery: true },
      { label: _('Date descending'), value: 'newest', icon: 'fa fa-sort-amount-desc', defaultNoQuery: true },
      { label: _('Date ascending'), icon: 'fa fa-sort-amount-asc', value: 'oldest' },
      { label: _('Title'), icon: 'fa fa-sort-alpha-asc', value: 'title' },
    ],
      canAdd: () => routeToolService.canAccess('documents', 'add'),
      canUpdate: (record: RecordData) => routeToolService.canAccess('documents', 'update', record),
      canDelete: (record: RecordData) => routeToolService.canAccess('documents', 'delete', record),
      canRead: (record: RecordData) => routeToolService.canAccess('documents', 'read', record),
    }])
  );
};

export const documentsRoutes: Routes = [
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
