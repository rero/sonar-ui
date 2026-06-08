/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
