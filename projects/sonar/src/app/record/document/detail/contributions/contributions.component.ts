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
import { Component, input, OnInit, signal } from '@angular/core';
import { IContribution } from '../../contribution.interface';

@Component({
    selector: 'sonar-contributions',
    templateUrl: './contributions.component.html',
    standalone: false
})
export class ContributionsComponent implements OnInit {

  contributions = input.required<IContribution[]>();

  meeting = input<boolean>(false);

  additionalInfosFields = input<boolean>(false);

  contributorsLength = signal<number>(5);

  showMore = signal<boolean>(true);

  /** OnInit Hook */
  ngOnInit(): void {
    if (this.meeting()) {
      this.contributorsLength.set(this.contributions()?.length || 0);
    }
  }

  /**
   * Show all contributors when clicking on the show more link.
   *
   * @param event DOM event triggered.
   */
  showMoreContributors(event: any): void {
    event.preventDefault();
    this.showMore.set(false);
    this.contributorsLength.set(this.contributions()
      ? this.contributions().length
      : 0);
  }
}
