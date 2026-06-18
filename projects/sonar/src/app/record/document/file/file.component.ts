// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DocumentFile } from '../document.interface';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { ButtonDirective, Button } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'sonar-document-file',
    templateUrl: './file.component.html',
    imports: [RouterLink, NgTemplateOutlet, Bind, Tag, ButtonDirective, Button, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
