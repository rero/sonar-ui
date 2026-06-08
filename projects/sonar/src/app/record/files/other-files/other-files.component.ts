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
import { ChangeDetectionStrategy, Component, computed, inject, input, model, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { RecordService } from '@rero/ng-core';
import { PaginatorState, Paginator } from 'primeng/paginator';
import { Observable, map, switchMap, tap } from 'rxjs';
import { File, previewFile } from '../../../type/fileType';
import { Bind } from 'primeng/bind';
import { InputGroup } from 'primeng/inputgroup';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Carousel } from 'primeng/carousel';
import { NgClass } from '@angular/common';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FaIconClassPipe } from '../../../pipe/fa-icon-class.pipe';

@Component({
    selector: 'sonar-other-files',
    templateUrl: './other-files.component.html',
    imports: [Bind, InputGroup, ReactiveFormsModule, InputText, FormsModule, InputGroupAddon, Carousel, NgClass, Button, ButtonDirective, Paginator, Dialog, TranslatePipe, FaIconClassPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherFilesComponent {

  private readonly translateService = inject(TranslateService);
  private readonly recordService = inject(RecordService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly breakpointObserver = inject(BreakpointObserver);

  documentPid = input.required<string>();

  files = toSignal(toObservable(this.documentPid).pipe(switchMap(() => this.getFiles())));

  private readonly breakpointState = toSignal(
    this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large])
  );

  filteredFiles = computed(() => {
    const text = this.filterText().toLowerCase();
    if (text.length > 0) {
      return this.files()?.filter((value) => value.label.toLowerCase().includes(text)) ?? [];
    }
    return this.files() ?? [];
  });

  resultsText = computed(() => {
    const remoteTotal = this.files()?.length ?? 0;
    const totalFiltered = this.filteredFiles().length;
    if (totalFiltered === remoteTotal) {
      return this.translateService.instant('{{ total }} results', { total: remoteTotal });
    }
    return totalFiltered === 0
      ? this.translateService.instant('no result')
      : this.translateService.instant('{{ total }} results of {{ remoteTotal }}', {
          total: totalFiltered,
          remoteTotal,
        });
  });

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

  filterText = model('');
  page = signal(0);
  loading = signal(false);
  previewFile = signal<previewFile | null>(null);
  isShowPreview = model(false);

  /**
   * Retrieves the files information from the backend.
   */
  getFiles(): Observable<File[]> {
    // retrieve all records files linked to a given document pid
    this.loading.set(true);
    return this.recordService
      .getRecord('documents', this.documentPid(), { resolve: 1 })
      .pipe(
        tap(() => (this.loading.set(false))),
        map((res: { metadata?: { _files?: Record<string, unknown>[] } }) => res?.metadata?._files ?? []),
        map((res: Record<string, unknown>[]) => {
          const files: File[] = [];
            const data: Record<string, File> = {};
            // retrieve main files
            res.map((entry) => {
              // main file (such as pdf) and avoid the first
              if (entry['type'] == 'file' && entry?.['order'] != '1') {
                const links = entry['links'] as Record<string, string>;
                const dataFile: Partial<File> & { mimetype?: string } = {
                  label: entry?.['label'] ? entry['label'] as string : entry['key'] as string,
                  download: links['download'],
                };
                if (links?.['preview']) {
                  dataFile.preview = links['preview'];
                }
                if (entry?.['thumbnail']) {
                  dataFile.thumbnail = entry['thumbnail'] as string;
                }
                data[entry['key'] as string] = dataFile as File;
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
    this.page.set(event.page ?? 0);
  }

  /** Open the file preview in a modal container.
   *
   * @param file - the file to preview.
   */
  preview(file: File): void {
    if (!file.preview) {
      return;
    }
    this.previewFile.set({
      label: file.label,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(file.preview),
    });
    this.isShowPreview.set(true);
  }
}
