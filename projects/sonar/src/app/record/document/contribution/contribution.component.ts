/*
 * SONAR User Interface
 * Copyright (C) 2022-2025 RERO
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
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IContribution } from '../contribution.interface';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IdentifierComponent } from '../../identifier/identifier.component';
import { Tooltip } from 'primeng/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { JoinPipe } from '../../../core/join.pipe';
import { FaIconClassPipe } from '../../../pipe/fa-icon-class.pipe';

type MeetingField = 'number' | 'date' | 'place';
const MEETING_FIELDS: MeetingField[] = ['number', 'date', 'place'];

@Component({
    selector: 'sonar-contribution',
    templateUrl: './contribution.component.html',
    imports: [NgClass, RouterLink, IdentifierComponent, Tooltip, TranslatePipe, JoinPipe, FaIconClassPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributionComponent {

  contributor = input.required<IContribution>();

  view = input<string>();

  viewType = input<'brief' | 'detail'>('brief');

  route = computed(() => this.view() ? ['/', this.view(), 'search', 'documents'] : ['/records', 'documents']);

  meetingInfo = computed(() => {
    const { agent } = this.contributor();
    const parts = MEETING_FIELDS
      .filter(key => agent[key] != null)
      .map(key => agent[key] as string);

    return parts.length > 0 ? parts.join(' : ') : null;
  });
}
