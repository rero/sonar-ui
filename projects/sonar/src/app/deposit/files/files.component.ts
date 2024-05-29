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
import { Component, input } from '@angular/core';

@Component({
    selector: 'sonar-deposit-files',
    templateUrl: './files.component.html',
    standalone: false
})
export class FilesComponent {
  mainFile = input.required<any>();
  depositPid = input.required<string>();
  additionalFiles = input<any>();
  /** File key to preview */
  previewFileKey: string;
  isShowPreview = false;
}
