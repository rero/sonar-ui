/*
 * SONAR User Interface
 * Copyright (C) 2024-2025 RERO
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
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { CONFIG, RecordService } from '@rero/ng-core';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { OrderList } from 'primeng/orderlist';
import { Observable, catchError, combineLatest, concatMap, from, map, of, switchMap, tap, toArray } from 'rxjs';
import { AppConfigService } from '../../../app-config.service';
import { Bind } from 'primeng/bind';
import { Message } from 'primeng/message';
import { FileItemComponent } from '../file-item/file-item.component';

export type RecordFileMeta = {
  key: string;
  order?: number;
  type?: string;
  label?: string;
  created?: number;
  permissions?: Record<string, boolean>;
  [key: string]: unknown;
}

export type RecordFile = {
  key: string;
  is_head?: boolean;
  label?: string;
  name?: string;
  version_id?: string;
  metadata?: RecordFileMeta;
  versions?: RecordFile[];
  links?: Record<string, string>;
  [key: string]: unknown;
}

type RecordWithFiles = {
  pid: string;
  _files?: RecordFileMeta[];
  [key: string]: unknown;
}

@Component({
    selector: 'sonar-upload-files',
    templateUrl: './upload-files.component.html',
    imports: [
        NgxSpinnerComponent,
        TranslateDirective,
        Bind,
        FileUpload,
        Message,
        OrderList,
        PrimeTemplate,
        FileItemComponent,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadFilesComponent {

  private httpClient: HttpClient = inject(HttpClient);
  private recordService: RecordService = inject(RecordService);
  private translateService: TranslateService = inject(TranslateService);
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService = inject(ConfirmationService);
  private spinner: NgxSpinnerService = inject(NgxSpinnerService);
  private appConfigService: AppConfigService = inject(AppConfigService);

  // number of uploaded files
  nUploadedFiles = signal<number>(0);

  // resource pid
  pid = input.required<string>();

  // record type such as documents
  recordType = input.required<string>();

  filesChanged = output<RecordFile[]>();

  // initial record from pid and recordType
  initialRecord = toSignal(
    combineLatest([toObservable(this.pid), toObservable(this.recordType)]).pipe(
      switchMap(([pid, recordType]) =>
        pid && recordType
          ? this.httpClient
              .get<{ metadata: RecordWithFiles }>(`/api/${recordType}/${pid}`)
              .pipe(map(rec => rec.metadata))
          : of(null)
      )
    )
  );
  // current record
  record: RecordWithFiles = { pid: '' };

  // initial files form record
  initialFiles = toSignal(
    toObservable(this.initialRecord).pipe(
      switchMap((record) => (record ? this.getFiles(record) : of([])))
    )
  );

  // current list of files
  files = signal<RecordFile[] | null>(null);

  // record JSONSchema for the editor
  fileSchema = toSignal(
    toObservable(this.recordType).pipe(
      switchMap((recordType) =>
        recordType
          ? this.recordService
              .getSchemaForm(recordType)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .pipe(map((res: any) => res.schema.properties._files.items))
          : of([])
      )
    )
  );

  // the maximum number of files by file record
  maxFiles = 500;

  fileUpload = viewChild<FileUpload>('fileUpload');

  // maximum upload file size
  maxFileSize: number;

  orderList = viewChild.required<OrderList>('orderList');

  /**
   * constructor
   */
  constructor() {
    this.maxFileSize = this.appConfigService.maxFileSize;
    // update the current record and files when the inputs change
    effect(() => {
      this.record = this.initialRecord() ?? { pid: '' };
      this.files.set(this.initialFiles() ?? []);
    });
  }

  /**
   * Update the file metadata.
   *
   * @param file the file object to update the label.
   * @param metadata the new metadata.
   */
  update(file: RecordFile, metadata: RecordFileMeta) {
    // remove useless spaces
    if(!metadata.label) {
      metadata.label = file.key;
    }
    metadata.label = metadata.label.trim();

    const indexToUpdate = this.record._files?.findIndex(
      (item) => item.key === file.key
    ) ?? -1;
    if (indexToUpdate >= 0) {
      this.record._files![indexToUpdate] = metadata;
      this.httpClient
        .put<{ metadata: RecordWithFiles }>(`/api/${this.recordType()}/${this.pid()}`, this.record)
        .subscribe((record) => {
          // update the current record
          this.record = record.metadata;
          file.metadata = this._getFileInRecord(file.key) ?? undefined;
          file.label = file.metadata?.label;
          this.messageService.add({
            severity: 'success',
            detail: this.translateService.instant('Metadata have been saved successfully.'),
            life: CONFIG.MESSAGE_LIFE,
          });
          this.filesChanged.emit(this.files() ?? []);
        });
    }
  }

  // True if the maximum number of files is reached.
  reachMaxFileLimit = computed(() => (this.files()?.length ?? 0) >= this.maxFiles);

  /**
   * Upload a new file.
   *
   * @param event the standard event.
   * @param _ unused.
   */
  uploadHandler(event: { files: globalThis.File[] }, _: unknown) {
    if (event.files.length > 0) {
      this.spinner.show('file-upload');
      const obs: Observable<void[]> = this.generateCreateRequests(event);
      obs
        .pipe(
          catchError((e: { error?: { message?: string } }) => {
            let msg = this.translateService.instant('Server error');
            if (e?.error?.message) {
              msg = `${msg}: ${e.error.message}`;
            }
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(msg),
              sticky: true,
              closable: true,
            });
            return of([]);
          }),
          switchMap(() => this.getRecord()),
          switchMap(() => {
            return this._reorder();
          }),
          tap(() => {
            this.resetFilter();
            this.fileUpload()!.clear();
            this.messageService.add({
              severity: 'success',
              detail: this.translateService.instant('File uploaded successfully.'),
              life: CONFIG.MESSAGE_LIFE,
            });
            this.nUploadedFiles.set(0);
            this.filesChanged.emit(this.files() ?? []);
          })
        )
        .subscribe(() => this.spinner.hide('file-upload'));
    }
  }

  /**
   * Upload a new version of a given file.
   * @param event - dict with the file and the fileUpload stream.
   */
  uploadNewVersion(event: { file: RecordFile; fileUpload: globalThis.File }) {
    const { file } = event;
    const fileUpload: globalThis.File = event.fileUpload;
    this.spinner.show('file-upload');
    this.httpClient
      .put(
        `/api/${this.recordType()}/${this.pid()}/files/${file.key}`,
        fileUpload
      )
      .pipe(
        catchError((e: { error?: { message?: string } }) => {
          let msg = this.translateService.instant('Server error');
          if (e?.error?.message) {
            msg = `${msg}: ${e.error.message}`;
          }
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(msg),
            sticky: true,
            closable: true,
          });
          return of(null);
        }),
        switchMap(() =>
          // update the record and the files
          this.getRecord()
        ),
        tap(() => {
          this.filesChanged.emit(this.files() ?? []);
          this.resetFilter();
          this.messageService.add({
            severity: 'success',
            detail: this.translateService.instant('File uploaded successfully.'),
            life: CONFIG.MESSAGE_LIFE,
          });
        })
      )
      .subscribe(() => this.spinner.hide('file-upload'));
  }

  /**
   * Get the record and the files from the backend.
   */
  getRecord() {
    return this.httpClient.get<{ metadata: RecordWithFiles }>(`/api/${this.recordType()}/${this.pid()}`).pipe(
      map(rec => rec.metadata),
      tap((record) => (this.record = record)),
      switchMap((record) => this.getFiles(record)),
      tap((files) => this.files.set(files))
    );
  }

  /**
   * Generate the sequential http requests.
   *
   * @param event the standard event.
   * @returns an observable of sequential http requests
   */
  private generateCreateRequests(event: { files: globalThis.File[] }): Observable<void[]> {
    return from(event.files).pipe(
      concatMap((f: globalThis.File) =>
        this.httpClient.put<RecordFile>(
          `/api/${this.recordType()}/${this.pid()}/files/${f.name}`,
          f
        )
      ),
      map((file: RecordFile) => {
        this.nUploadedFiles.set(this.nUploadedFiles() + 1);
        this.files.set(this.processFiles([
          {
            label: file['key'],
            metadata: { key: file['key'] as string, order: (this.files() ?? []).length + 1 },
            ...file,
          },
          ...(this.files() ?? []),
        ]));
      }),
      // like a forkJoin
      toArray()
    );
  }

  /**
   * Filter the uploaded files.
   *
   * @param event the standard event.
   * @param _ unused.
   */
  onSelect(event: { files: (globalThis.File & { label?: string })[] }, _: unknown) {
    const existingFileNames: string[] = [];
    for (const file of event.files) {
      const fileName = file.name;
      if ((this.files() ?? []).some((v) => v.key == fileName)) {
        existingFileNames.push(fileName);
      } else {
        file.label = fileName;
      }
    }
    if (existingFileNames.length > 0) {
      (this.fileUpload()!.msgs ??= []).push({
        severity: 'error',
        text: this.translateService.instant('These filenames already exists') + `: ${existingFileNames.join(', ')}`
      });
      this.fileUpload()!.files = this.fileUpload()!.files.filter(
        (v) => !existingFileNames.some((n) => n == v.name)
      );
    }
    const numberOfMaxUploadedFiles = this.maxFiles - (this.files() ?? []).length;
    if (numberOfMaxUploadedFiles < this.fileUpload()!.files.length) {
      this.fileUpload()!.files = this.fileUpload()!.files.slice(
        0,
        numberOfMaxUploadedFiles
      );
    }
  }

  /**
   * Removes a given file.
   *
   * @param file - the file to delete.
   */
  deleteFile(file: RecordFile) {
    this.confirmationService.confirm({
      header: this.translateService.instant('Confirmation'),
      message: this.translateService.instant(
        'Do you really want to remove this file and all versions?'
      ),
      closable: false,
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.httpClient
          .delete(`/api/${this.recordType()}/${this.pid()}/files/${file.key}`)
          .pipe(
            tap(() => {
              this.files.set((this.files() ?? []).filter((f) => f.key !== file.key));
              this.record._files = this.record._files?.filter(
                (item) => file.key !== item.key
              );
            }),
            switchMap(() => this._reorder()),
            tap(() => {
              this.resetFilter();
              this.messageService.add({
                severity: 'success',
                detail: this.translateService.instant('File removed successfully.'),
                life: CONFIG.MESSAGE_LIFE,
              });
              this.filesChanged.emit(this.files() ?? []);
            })
          )
          .subscribe();
      },
    });
  }

  /**
   * Reset the query to filter the file list.
   */
  resetFilter() {
    this.orderList().resetFilter();
  }

  /**
   * Observable for loading record and files.
   *
   * @returns Observable emitting files
   */
  private getFiles(record: RecordWithFiles): Observable<RecordFile[]> {
    return this.httpClient
      .get<{ contents?: RecordFile[] }>(`/api/${this.recordType()}/${record.pid}/files?versions`)
      .pipe(
        map((res) => {
          if (res?.contents) {
            return res.contents;
          }
          return [];
        }),
        map((files) => {
          return files.map((item: RecordFile) => {
            item.metadata = this._getFileInRecord(item.key);
            if (item?.label == null) {
              item.label = item?.metadata?.label
                ? item.metadata.label
                : item.key;
            }
            return item;
          });
        }),
        map((files) => {
          return this.processFiles(files);
        }),
        catchError(() => {
          return of([]);
        })
      );
  }

  /**
   * Process the list of files from the backend.
   * @param files the files to process
   * @returns the processed files
   */
  private processFiles(files: RecordFile[]): RecordFile[] {
    // get old versions
    const versions: Record<string, RecordFile[]> = {};
    files.map((file) => {
      if (file?.metadata?.type && file.metadata.type !== 'file') {
        return;
      }
      if (file.is_head === false) {
        if (!(file.key in versions)) versions[file.key] = [];
        versions[file.key].push(file);
      }
    });
    // get head files only
    const headFiles: RecordFile[] = [];
    files.map((file) => {
      if (file?.metadata?.type && file.metadata.type !== 'file') {
        return;
      }
      if (file.is_head) {
        // add versions if exists
        if (versions[file.key]) {
          const fileVersions = versions[file.key];
          fileVersions.sort((a: RecordFile, b: RecordFile) => (a.metadata?.created ?? 0) - (b.metadata?.created ?? 0));
          file.versions = fileVersions;
        }
        // TODO: remove when the primeng issue will be solved
        //       https://github.com/primefaces/primeng/issues/18442
        file.name = file.label;
        headFiles.push(file);
      }
    });
    headFiles.sort((a: RecordFile, b: RecordFile) => (a.metadata?.order ?? 0) - (b.metadata?.order ?? 0));
    return headFiles;
  }

  /**
   * Reorder the files.
   */
  reorder() {
    this._reorder().subscribe(() => {
      this.filesChanged.emit(this.files() ?? []);
    });
  }

  _reorder() {
    (this.files() ?? []).map((file, index) => {
      const recordFile = this._getFileInRecord(file.key);
      if (recordFile) recordFile.order = index + 1;
    });
    return this.httpClient
      .put<{ metadata: RecordWithFiles }>(`/api/${this.recordType()}/${this.pid()}`, this.record)
      .pipe(
        tap((record) => {
          this.record = record.metadata;
          (this.files() ?? []).map((file) => {
            file.metadata = this._getFileInRecord(file.key) ?? undefined;
          });
        })
      );
  }

  /**
   * Get files metadata corresponding to file key, stored in record.
   *
   * @param fileKey File key.
   * @returns Metadata object for the file.
   */
  private _getFileInRecord(fileKey: string): RecordFileMeta | null {
    if (!this.record._files) {
      return null;
    }

    // Get metadata stored in record.
    const metadata = this.record._files.filter(
      (item) => fileKey === item.key
    );

    return metadata.length > 0 ? metadata[0] : null;
  }
}
