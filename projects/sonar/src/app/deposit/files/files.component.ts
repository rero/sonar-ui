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
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';
import { DepositFile } from '../../models';
import { Bind } from 'primeng/bind';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FilesizePipe } from '@rero/ng-core';
import { FileLinkPipe } from '../../core/file-link.pipe';

@Component({
    selector: 'sonar-deposit-files',
    templateUrl: './files.component.html',
    imports: [TranslateDirective, Bind, Button, ButtonDirective, Dialog, FilesizePipe, FileLinkPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesComponent {
  mainFile = input.required<DepositFile>();
  depositPid = input.required<string>();
  additionalFiles = input<DepositFile[]>();
  /** File key to preview */
  previewFileKey = signal<string>('');
  isShowPreview = signal<boolean>(false);
}
