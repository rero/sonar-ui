// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecordData } from '@rero/ng-core';
import { TranslateDirective } from '@ngx-translate/core';
import { UploadFilesComponent } from '../../files/upload-files/upload-files.component';
import { AsyncPipe } from '@angular/common';
import { MarkdownPipe } from '@rero/ng-core';
import { LanguageValuePipe } from '../../../pipe/language-value.pipe';

@Component({
    templateUrl: './detail.component.html',
    imports: [TranslateDirective, UploadFilesComponent, AsyncPipe, MarkdownPipe, LanguageValuePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent {
  record = input.required<RecordData>();
  type = input<string>();
}
