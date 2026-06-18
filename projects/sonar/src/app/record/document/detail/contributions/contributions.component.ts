// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
