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
import { ActivatedRouteSnapshot, ResolveFn, Routes, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@ngx-translate/core';
import { Bucket, DetailComponent, EditorComponent, RecordData, RecordSearchPageComponent } from '@rero/ng-core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminComponent } from './_layout/admin/admin.component';
import { OutletComponent } from './_layout/outlet/outlet.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { dedicatedGuard } from './guard/dedicated.guard';
import { roleGuard } from './guard/role.guard';
import { AggregationFilter } from './record/document/aggregation-filter';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { collectionsRouteResolver } from './routes/collections-route';
import { depositsRouteResolver } from './routes/deposits-route';
import { BucketNameService } from './bucket-name.service';
import { documentsRouteResolver, fetchAggregationsOrder } from './routes/documents-route';
import { organisationsRouteResolver } from './routes/organisations-route';
import { projectsRouteResolver } from './routes/projects-route';
import { subdivisionsRouteResolver } from './routes/subdivisions-route';
import { typeResolver } from './routes/type-resolver';
import { usersRouteResolver } from './routes/users-route';

export { typeResolver };

const recordMatcher = (type: string) => (url: UrlSegment[]) => {
  if (url[0]?.path === 'records' && url[1]?.path === type) {
    const segments = [new UrlSegment(url[0].path, {}), new UrlSegment(url[1].path, {})];
    return { consumed: segments, posParams: { type: new UrlSegment(url[1].path, {}) } };
  }
  return null;
};

const publicSearchViewResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  const view = route.params['view'];
  const types = route.data['types'] as Record<string, unknown>[];
  if (view && types?.[0]) {
    types[0]['detailUrl'] = `/${view}/:type/:pid`;
    types[0]['preFilters'] = { view };
  }
};

const publicDocumentsAggregationsResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  AggregationFilter.translateService = inject(TranslateService);
  const bucketNameService = inject(BucketNameService);
  const types = route.data['types'] as Record<string, unknown>[];
  if (!types?.[0]) return;
  return fetchAggregationsOrder(route).pipe(
    map((aggregationsOrder) => {
      types[0]['aggregationsOrder'] = aggregationsOrder;
      types[0]['processBucketName'] = (bucket: Bucket) => bucketNameService.transform(bucket);
    })
  );
};

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        title: _('Administration'),
        component: DashboardComponent,
      },
      {
        path: 'deposit',
        loadChildren: () => import('./routes/deposits-route').then((m) => m.depositsRoutes),
      },
      {
        matcher: recordMatcher('documents'),
        loadChildren: () => import('./routes/documents-route').then((m) => m.documentsRoutes),
        resolve: { types: documentsRouteResolver },
      },
      {
        matcher: recordMatcher('users'),
        loadChildren: () => import('./routes/users-route').then((m) => m.usersRoutes),
        resolve: { types: usersRouteResolver },
      },
      {
        matcher: recordMatcher('organisations'),
        loadChildren: () => import('./routes/organisations-route').then((m) => m.organisationsRoutes),
        resolve: { types: organisationsRouteResolver },
      },
      {
        matcher: recordMatcher('deposits'),
        loadChildren: () => import('./routes/deposits-route').then((m) => m.depositsRecordRoutes),
        resolve: { types: depositsRouteResolver },
      },
      {
        matcher: recordMatcher('projects'),
        loadChildren: () => import('./routes/projects-route').then((m) => m.projectsRoutes),
        resolve: { types: projectsRouteResolver },
      },
      {
        matcher: recordMatcher('collections'),
        canActivate: [dedicatedGuard],
        loadChildren: () => import('./routes/collections-route').then((m) => m.collectionsRoutes),
        resolve: { types: collectionsRouteResolver },
      },
      {
        matcher: recordMatcher('subdivisions'),
        canActivate: [dedicatedGuard],
        loadChildren: () => import('./routes/subdivisions-route').then((m) => m.subdivisionsRoutes),
        resolve: { types: subdivisionsRouteResolver },
      },
      {
        path: ':type/profile/:pid',
        title: typeResolver,
        component: EditorComponent,
        canActivate: [roleGuard],
        data: {
          hideHeader: true,
          types: [
            { key: 'users', redirectUrl: (record: RecordData) => of(`/users/profile/${record.id}`) },
          ],
        },
      },
    ],
  },
  {
    path: ':view/search',
    component: OutletComponent,
    resolve: { init: publicDocumentsAggregationsResolver, view: publicSearchViewResolver },
    data: {
      showSearchInput: false,
      adminMode: false,
      types: [
        {
          showLabel: false,
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          detailComponent: DocumentDetailComponent,
          canAdd: () => of({ can: false, message: '' }),
          canUpdate: () => of({ can: false, message: '' }),
          canDelete: () => of({ can: false, message: '' }),
          aggregations: AggregationFilter.filter,
          aggregationsExpand: ['document_type', 'controlled_affiliation', 'year'],
          aggregationsBucketSize: 10,
          exportFormats: [],
          searchFields: [{ label: _('Search in full-text'), path: 'fulltext' }],
          searchFilters: [{ label: _('Open access'), filter: 'open_access', value: 'true' }],
          sortOptions: [
            { label: _('Relevance'), value: 'relevance', icon: 'fa fa-sort-amount-desc', defaultQuery: true },
            { label: _('Date descending'), value: 'newest', icon: 'fa fa-sort-amount-desc', defaultNoQuery: true },
            { label: _('Date ascending'), icon: 'fa fa-sort-amount-asc', value: 'oldest' },
            { label: _('Title'), icon: 'fa fa-sort-alpha-asc', value: 'title' },
          ],
        },
      ],
    },
    children: [
      { path: ':type', title: typeResolver, component: RecordSearchPageComponent },
      { path: ':type/detail/:pid', title: typeResolver, component: DetailComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
