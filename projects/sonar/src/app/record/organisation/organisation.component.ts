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
import { DetailUrl, MarkdownPipe, UpperCaseFirstPipe, RecordData } from '@rero/ng-core';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './organisation.component.html',
    imports: [RouterLink, Bind, Tag, TranslatePipe, MarkdownPipe, UpperCaseFirstPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganisationComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();
}
