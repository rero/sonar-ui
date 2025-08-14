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
import { Component, input, output } from '@angular/core';
import { DocumentFile } from '../document.interface';

@Component({
  selector: 'sonar-document-file',
  templateUrl: './file.component.html',
  standalone: false
})
export class FileComponent {

  file = input.required<DocumentFile>();

  showPreview = input<boolean>(true);

  showDownload = input<boolean>(true);

  showExternalLink = input<boolean>(true);

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
