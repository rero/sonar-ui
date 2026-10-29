// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { ApiService, JsonObject, RecordData, RecordType } from '@rero/ng-core';

import { DetailComponent as HepvsProjectDetailComponent } from '../record/hepvs/project/detail/detail.component';
import { BriefViewComponent as ProjectBriefViewComponent } from '../record/project/brief-view/brief-view.component';
import { DetailComponent as ProjectDetailComponent } from '../record/project/detail/detail.component';
import { AppStore, AppStoreType, type AppState } from '../store/app.store';
import { RouteToolService } from './route-tool.service';

export const projectsRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);
  const apiService = inject(ApiService);
  const store = inject(AppStore) as AppStoreType;
  const user = store.user();
  const organisation = store.organisation() as AppState['organisation'];
  const organisationCode = organisation?.code;

  const detailComponent = organisationCode === 'hepvs' ? HepvsProjectDetailComponent : ProjectDetailComponent;

  return [
    {
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
      preCreateRecord: (record: JsonObject): JsonObject => {
        // The editor wraps the form data in `metadata` for a record resource.
        const metadata = record.metadata as JsonObject;
        const organisationCode = organisation?.code;
        if (organisationCode) {
          metadata.organisation = { $ref: apiService.getRefEndpoint('organisations', organisationCode) };
        }
        const userPid = user?.pid;
        if (userPid) {
          metadata.user = { $ref: apiService.getRefEndpoint('users', userPid) };
        }
        return record;
      },
      exportFormats: [{ label: 'CSV', format: 'text/csv', endpoint: null, disableMaxRestResultsSize: false }],
      sortOptions: [
        { label: _('Relevance'), value: 'relevance', icon: 'fa-solid fa-arrow-down-wide-short', defaultQuery: true },
        { label: _('Name'), value: 'name', icon: 'fa-solid fa-arrow-down-a-z', defaultNoQuery: true },
        { label: _('Date descending'), icon: 'fa-solid fa-arrow-down-wide-short', value: 'newest' },
        { label: _('Date ascending'), icon: 'fa-solid fa-arrow-down-short-wide', value: 'oldest' },
      ],
      canAdd: () => routeToolService.canAccess('projects', 'add'),
      canUpdate: (record: RecordData) => routeToolService.canAccess('projects', 'update', record),
      canDelete: (record: RecordData) => routeToolService.canAccess('projects', 'delete', record),
      canRead: (record: RecordData) => routeToolService.canAccess('projects', 'read', record),
    },
  ];
};
