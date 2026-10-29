// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { Divider } from '@openng/optimus-ui/divider';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { ApiService } from '@rero/ng-core';

type FileEntry = { count: number };

type StatisticsData = {
  'file-download': Record<string, FileEntry>;
  'record-view': { count: number };
};

@Component({
  selector: 'sonar-stats-files',
  templateUrl: './stats-files.component.html',
  imports: [TranslatePipe, Bind, Divider, Tooltip],
})
export class StatsFilesComponent {
  private readonly httpClient = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  record = input.required<Record<string, unknown>>();
  filteredFiles = input.required<Record<string, unknown>[]>();

  statistics = signal<StatisticsData | null>(null);

  constructor() {
    effect(() => this.loadStats());
  }

  private loadStats(): void {
    const meta = this.record();
    const body = {
      'record-view': { stat: 'record-view', params: { pid_value: meta['pid'], pid_type: 'doc' } },
      'file-download': { stat: 'file-download', params: { bucket_id: meta['_bucket'] } },
    };

    this.httpClient
      .post<Record<string, unknown>>(this.apiService.getEndpointByType('stats', true), body)
      .subscribe((results) => {
        const statistics: StatisticsData = {
          'record-view': { count: (results['record-view'] as Record<string, number>)['unique_count'] ?? 0 },
          'file-download': {},
        };
        const buckets = (results['file-download'] as Record<string, unknown>)?.['buckets'] as
          Record<string, unknown>[] | undefined;
        buckets?.forEach((res) => {
          statistics['file-download'][res['key'] as string] = { count: res['unique_count'] as number };
        });
        this.statistics.set(statistics);
      });
  }
}
