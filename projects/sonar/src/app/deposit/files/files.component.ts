// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { Button, ButtonDirective } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { FilesizePipe } from '@rero/ng-core';

import { FileLinkPipe } from '../../core/file-link.pipe';
import { DepositFile } from '../../models';

@Component({
  selector: 'sonar-deposit-files',
  templateUrl: './files.component.html',
  imports: [TranslatePipe, Bind, Button, ButtonDirective, Dialog, FilesizePipe, FileLinkPipe],
})
export class FilesComponent {
  mainFile = input.required<DepositFile>();
  depositPid = input.required<string>();
  additionalFiles = input<DepositFile[]>();
  /** File key to preview */
  previewFileKey = signal<string>('');
  isShowPreview = signal<boolean>(false);
}
