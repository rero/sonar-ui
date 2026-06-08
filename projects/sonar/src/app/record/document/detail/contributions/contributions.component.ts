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
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IContribution } from '../../contribution.interface';
import { ContributionComponent } from '../../contribution/contribution.component';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { SlicePipe } from '@angular/common';
import { ContributorsPipe } from '../../../../pipe/contributors.pipe';

@Component({
    selector: 'sonar-contributions',
    templateUrl: './contributions.component.html',
    imports: [ContributionComponent, TranslateDirective, SlicePipe, TranslatePipe, ContributorsPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributionsComponent {

  contributions = input.required<IContribution[]>();

  meeting = input<boolean>(false);

  additionalInfosFields = input<boolean>(false);

  showMore = signal<boolean>(true);

  contributorsLength = computed(() =>
    !this.showMore() || this.meeting() ? this.contributions().length : 5
  );

  showMoreContributors(event: MouseEvent): void {
    event.preventDefault();
    this.showMore.set(false);
  }
}
