// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
