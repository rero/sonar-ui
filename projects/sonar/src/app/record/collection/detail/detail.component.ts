// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MarkdownPipe, RecordData } from '@rero/ng-core';

import { LanguageValuePipe } from '../../../pipe/language-value.pipe';
import { UploadFilesComponent } from '../../files/upload-files/upload-files.component';

@Component({
  templateUrl: './detail.component.html',
  imports: [TranslatePipe, UploadFilesComponent, AsyncPipe, MarkdownPipe, LanguageValuePipe],
})
export class DetailComponent {
  record = input.required<RecordData>();
  type = input<string>();
}
