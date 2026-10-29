// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Bind } from '@openng/optimus-ui/bind';
import { Button, ButtonDirective } from '@openng/optimus-ui/button';
import { Divider } from '@openng/optimus-ui/divider';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { FileUpload, FileUploadHandlerEvent } from '@openng/optimus-ui/fileupload';
import { Panel } from '@openng/optimus-ui/panel';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { DateTranslatePipe, FilesizePipe } from '@rero/ng-core';

import { AppConfigService } from '../../../app-config.service';
import { FieldDescriptionComponent } from '../../../core/field-description/field-description.component';
import { RecordFile, RecordFileMeta } from '../upload-files/upload-files.component';

@Component({
  selector: 'sonar-file-item',
  templateUrl: './file-item.component.html',
  imports: [
    Bind,
    Panel,
    PrimeTemplate,
    NgTemplateOutlet,
    Button,
    FieldDescriptionComponent,
    Divider,
    FileUpload,
    ButtonDirective,
    Tooltip,
    TranslatePipe,
    DateTranslatePipe,
    FilesizePipe,
  ],
})
export class FileItemComponent {
  appConfigService: AppConfigService = inject(AppConfigService);
  dialogService: DialogService = inject(DialogService);
  translateService: TranslateService = inject(TranslateService);

  // file to display
  file = input.required<RecordFile>();

  schema = input.required<Record<string, unknown>>();

  // event when a file should be deleted
  delete = output<RecordFile>();
  // event when the file metadata should be updated
  update = output<RecordFileMeta>();
  // event when a new version of the file should be saved
  upload = output<{ file: RecordFile; fileUpload: globalThis.File }>();

  // maximum upload file size
  maxFileSize = computed(() => this.appConfigService.maxFileSize);

  async showEditor() {
    // Loaded on demand, so Formly stays out of the initial bundle.
    const { FileItemEditorComponent } = await import('../file-item-editor/file-item-editor.component');
    const modalRef = this.dialogService.open(FileItemEditorComponent, {
      header: this.translateService.instant('Metadata Editor'),
      modal: true,
      data: {
        file: this.file(),
        schema: this.schema(),
      },
      closable: true,
      width: '60vw',
    });
    modalRef?.onClose.subscribe((model) => (model ? this.update.emit(model) : null));
  }

  /**
   * Get the download URL for a given file
   *
   * @param file to generate the URL
   * @returns the URL as string
   */
  downloadURL(file: RecordFile): string {
    const links = file.links as Record<string, string>;
    const urlObj = new URL(links['self']);
    const baseUrl = urlObj.pathname;
    return `${baseUrl}/${file.key}?download&versionId=${file['version_id']}`;
  }

  /**
   * Delete a given file.
   *
   * @param file to delete
   */
  deleteFile(): void {
    this.delete.emit(this.file());
  }

  /**
   * Upload a new version of a file
   *
   * @param FileUploadHandlerEvent event
   */
  uploadHandler(event: FileUploadHandlerEvent): void {
    this.upload.emit({ file: this.file(), fileUpload: event.files[0] });
  }
}
