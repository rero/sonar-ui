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
import { Component, inject, OnInit, signal } from '@angular/core';
import { RecordService } from '@rero/ng-core';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  templateUrl: './detail.component.html',
  standalone: false
})
export class DetailComponent implements OnInit {

  private recordService: RecordService = inject(RecordService);

  /** Observable resolving record data */
  record$: Observable<any>;

  /** Organisation record. */
  record = signal(null);

  /** Subdivisions list. */
  subdivisions = signal([]);

  /** Collections list. */
  collections = signal([]);

  ngOnInit(): void {
    this.record$
      .pipe(
        switchMap((record: any) => {
          this.record.set(record);
          return combineLatest([
            this.recordService.getRecords(
              'subdivisions',
              `organisation.pid:${record.id}`
            ),
            this.recordService.getRecords(
              'collections',
              `organisation.pid:${record.id}`
            ),
          ]);
        })
      )
      .subscribe(([subdivisions, collections]: any) => {
        this.subdivisions.set(subdivisions.hits.hits);
        this.collections.set(collections.hits.hits);
      });
  }
}
