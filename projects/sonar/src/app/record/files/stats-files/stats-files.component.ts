/*
 * SONAR User Interface
 * Copyright (C) 2019-2025 RERO
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

import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ApiService } from '@rero/ng-core';
import { TranslateDirective } from '@ngx-translate/core';
import { Bind } from 'primeng/bind';
import { Divider } from 'primeng/divider';
import { Tooltip } from 'primeng/tooltip';

type FileEntry = { count: number };

type StatisticsData = {
  'file-download': Record<string, FileEntry>;
  'record-view': { count: number };
};

@Component({
    selector: 'sonar-stats-files',
    templateUrl: './stats-files.component.html',
    imports: [TranslateDirective, Bind, Divider, Tooltip],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        const buckets = (results['file-download'] as Record<string, unknown>)?.['buckets'] as Record<string, unknown>[] | undefined;
        buckets?.forEach((res) => {
          statistics['file-download'][res['key'] as string] = { count: res['unique_count'] as number };
        });
        this.statistics.set(statistics);
      });
  }
}
