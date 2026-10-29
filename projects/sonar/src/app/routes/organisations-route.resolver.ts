// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { File as NgCoreFile, RecordData, RecordType } from '@rero/ng-core';
import { of } from 'rxjs';

import { DetailComponent as OrganisationDetailComponent } from '../record/organisation/detail/detail.component';
import { OrganisationComponent } from '../record/organisation/organisation.component';
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

export const organisationsRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);

  return [
    {
      key: 'organisations',
      label: 'Organisations',
      component: OrganisationComponent,
      detailComponent: OrganisationDetailComponent,
      files: fileConfig,
      sortOptions: [
        { label: _('Relevance'), icon: 'fa-solid fa-arrow-down-wide-short', value: 'relevance', defaultQuery: true },
        { label: _('Name'), value: 'name', icon: 'fa-solid fa-arrow-down-a-z', defaultNoQuery: true },
      ],
      aggregationsBucketSize: 10,
      showFacetsIfNoResults: true,
      exportFormats: [],
      canAdd: () => routeToolService.canAccess('organisations', 'add'),
      canUpdate: (record: RecordData) => routeToolService.canAccess('organisations', 'update', record),
      canDelete: (record: RecordData) => routeToolService.canAccess('organisations', 'delete', record),
      canRead: (record: RecordData) => routeToolService.canAccess('organisations', 'read', record),
    },
  ];
};
