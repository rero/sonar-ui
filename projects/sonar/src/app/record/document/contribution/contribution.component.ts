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
import { Component, computed, input } from '@angular/core';
import { IContribution } from '../contribution.interface';

@Component({
  selector: 'sonar-contribution',
  templateUrl: './contribution.component.html',
  standalone: false
})
export class ContributionComponent {

  contributor = input.required<IContribution>();

  view? = input<string>();

  viewType = input<'brief' | 'detail'>('brief');

  route = computed(() => this.view() ? ['/', this.view(), 'search', 'documents'] : ['/records', 'documents']);

  meetingInfo = computed(() => {
    const { agent } = this.contributor();
    const meeting = [];
    ['number', 'date', 'place'].forEach((key: string) => {
      if (key in agent) {
        meeting.push(agent[key]);
      }
    });

    return meeting.length > 0 ? meeting.join(' : ') : null;
  });
}
