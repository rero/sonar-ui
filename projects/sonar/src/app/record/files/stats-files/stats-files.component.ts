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
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { ApiService } from '@rero/ng-core';
type FileEntry = {
  count: number;
  label?: string;
};

type StatisticsData = {
  'file-download': Record<string, FileEntry>;
  'record-view': {
    count: number;
  };
};

@Component({
  selector: 'sonar-stats-files',
  templateUrl: './stats-files.component.html',
  standalone: false,
})
export class StatsFilesComponent implements OnInit {
  private httpClient: HttpClient = inject(HttpClient);
  private apiService: ApiService = inject(ApiService);

  statistics = signal<StatisticsData | {}>({});

  record = input.required<any>();

  filteredFiles = input.required<any[]>();

  ngOnInit(): void {
    this.getStats();
  }

  /**
   * Get the stats corresponding to given record.
   */
  private getStats() {
    const data = {
      'record-view': {
        stat: 'record-view',
        params: {
          pid_value: this.record().pid,
          pid_type: 'doc',
        },
      },
      'file-download': {
        stat: 'file-download',
        params: {
          bucket_id: this.record()._bucket,
        },
      },
    };

    this.httpClient
      .post(`${this.apiService.getEndpointByType('stats', true)}`, data)
      .subscribe((results) => {
        const statistics: StatisticsData = {
          'record-view': { count: 0 },
          'file-download': {},
        };
        if (results['file-download']?.buckets) {
          results['file-download'].buckets.map(
            (res) =>
              (statistics['file-download'][res.key] = {
                count: res.unique_count,
              })
          );
        }
        statistics['record-view'] = {
          count: results['record-view'].unique_count,
        };
        this.statistics.set(statistics);
      });
  }
}
