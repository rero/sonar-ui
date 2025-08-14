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

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, input, model, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { RecordService } from '@rero/ng-core';
import { PaginatorState } from 'primeng/paginator';
import { Observable, map, switchMap, tap } from 'rxjs';
import { File, previewFile } from '../../../type/fileType';

// Component itself
@Component({
    selector: 'sonar-other-files',
    templateUrl: './other-files.component.html',
    standalone: false
})
export class OtherFilesComponent {

  private translateService: TranslateService = inject(TranslateService);
  private recordService: RecordService = inject(RecordService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  // input document pid
  documentPid = input.required<string>();

  // list of files
  files = toSignal(toObservable(this.documentPid).pipe(switchMap(() => this.getFiles())));

  breakpointState = toSignal(
    this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large])
  );

  // filtered array of files
  filteredFiles = computed(() => {
    if (this.filterText().length > 0) {
      return this.files().filter((value) =>
        value.label.toLowerCase().includes(this.filterText().toLowerCase()
    ));
    } else {
      return this.files();
    }
  });

  // Get the string used to display the search result number.
  getResultsText = computed(() => {
    const total = this.filteredFiles().length;
    if (total == this.files.length) {
      return this.translateService.stream('{{ total }} results', { total });
    }
    return total === 0
      ? this.translateService.stream('no result')
      : this.translateService.stream('{{ total }} results of {{ remoteTotal }}', {
          total,
          remoteTotal: this.files.length,
        });
  });

  // Changes the number of items in the carousel.
  numVisible = computed(() => {
    this.breakpointState();
    switch (true) {
      case this.breakpointObserver.isMatched(Breakpoints.XSmall):
        return 1;
      case this.breakpointObserver.isMatched(Breakpoints.Small):
        return 2;
      case this.breakpointObserver.isMatched(Breakpoints.Medium):
        return 4;
      default:
        return 5;
    }
  });

  // input text filter
  filterText = model('');

  // current page for the carousel
  page = signal(0);

  loading = signal(false);

  // file to preview
  previewFile = signal<previewFile|null>(null);

  isShowPreview = signal(false);

  /**
   * Retrieves the files information from the backend.
   */
  getFiles(): Observable<any> {
    // retrieve all records files linked to a given document pid
    this.loading.set(true);
    return this.recordService
      .getRecord('documents', this.documentPid(), 1)
      .pipe(
        tap(() => (this.loading.set(false))),
        map(res => res?.metadata?._files? res.metadata._files : []),
        map((res: any[]) => {
          const files = [];
            const data = {};
            // retrieve main files
            res.map((entry) => {
              // main file (such as pdf) and avoid the first
              if (entry.type == 'file' && entry?.order != '1') {
                const dataFile: any = {
                  label: entry?.label ? entry.label : entry.key,
                  mimetype: entry.mimetype,
                  download: entry.links.download,
                };
                if (entry?.links?.preview) {
                  dataFile.preview = entry.links.preview;
                }
                if (entry?.thumbnail) {
                  dataFile.thumbnail = entry.thumbnail;
                }
                data[entry.key] = dataFile;
              }
            });
            Object.values(data).map((d: File) => files.push(d));
          files.sort((a, b) => a.label.localeCompare(b.label, 'en', { numeric: true }));
          this.loading.set(false);
          return files;
        })
      );
  }

  /**
   * Fired when the page change in the paginator.
   * @param $event - standard event.
   */
  onPageChange(event: PaginatorState): void {
    this.page.set(event.page);
  }

  /** Open the file preview in a modal container.
   *
   * @param file - the file to preview.
   */
  preview(file: File): void {
    this.previewFile.set({
      label: file.label,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(file.preview),
    });
    this.isShowPreview.set(true);
  }
}
