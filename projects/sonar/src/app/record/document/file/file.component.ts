// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { Button, ButtonDirective } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';

import { DocumentFile } from '../document.interface';

@Component({
  selector: 'sonar-document-file',
  templateUrl: './file.component.html',
  imports: [RouterLink, NgTemplateOutlet, Bind, Tag, ButtonDirective, Button, TranslatePipe],
})
export class FileComponent {
  file = input.required<DocumentFile>();

  showPreview = input<boolean>(true);

  showDownload = input<boolean>(true);

  showExternalLink = input<boolean>(true);

  showStatistics = input<boolean>(true);

  statistics = input<unknown>();

  link? = input<string>();

  inRouter = input<boolean>(false);

  previewClicked = output<DocumentFile>();

  /**
   * Method called when a preview link is clicked.
   *
   * @param file Document file object.
   */
  preview(file: DocumentFile): void {
    this.previewClicked.emit(file);
  }
}
