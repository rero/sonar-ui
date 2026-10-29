// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { Bucket, IFilter, RecordData, RecordType } from '@rero/ng-core';
import { of } from 'rxjs';

import { BucketNameService } from '../bucket-name.service';
import { BriefViewComponent } from '../deposit/brief-view/brief-view.component';
import { RouteToolService } from './route-tool.service';

export const depositsRouteResolver: ResolveFn<Partial<RecordType>[]> = () => {
  const routeToolService = inject(RouteToolService);
  const bucketNameService = inject(BucketNameService);

  return [
    {
      key: 'deposits',
      label: 'Deposits',
      component: BriefViewComponent,
      aggregationsExpand: ['status', 'user', 'contributor'],
      aggregationsOrder: ['status', 'user', 'contributor', 'subdivision'],
      aggregationsBucketSize: 10,
      processBucketName: (bucket: Bucket) => bucketNameService.transform(bucket),
      processFilterName: (filter: IFilter) => bucketNameService.transform(filter),
      showFacetsIfNoResults: true,
      exportFormats: [],
      sortOptions: [
        { label: _('Relevance'), value: 'relevance', icon: 'fa-solid fa-arrow-down-wide-short', defaultQuery: true },
        {
          label: _('Date descending'),
          value: 'newest',
          icon: 'fa-solid fa-arrow-down-wide-short',
          defaultNoQuery: true,
        },
        { label: _('Date ascending'), value: 'oldest', icon: 'fa-solid fa-arrow-down-short-wide' },
      ],
      canAdd: () => of({ can: false, message: '' }),
      canUpdate: () => of({ can: false, message: '' }),
      canDelete: (record: RecordData) => routeToolService.canAccess('deposits', 'delete', record),
      canRead: (record: RecordData) => routeToolService.canAccess('deposits', 'read', record),
    },
  ];
};
