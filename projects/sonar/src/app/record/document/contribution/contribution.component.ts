// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IContribution } from '../contribution.interface';
import { NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  private activatedRoute = inject(ActivatedRoute);

  contributor = input.required<IContribution>();

  view = input<string>();

  viewType = input<'brief' | 'detail'>('brief');

  private routeView = computed(() => {
    let current: ActivatedRoute | null = this.activatedRoute;
    while (current) {
      const view = current.snapshot.paramMap.get('view');
      if (view) {
        return view;
      }
      current = current.parent;
    }
    return null;
  });

  private resolvedView = computed(() => this.view() ?? this.routeView());

  route = computed(() => this.resolvedView() ? ['/', this.resolvedView() as string, 'search', 'documents'] : ['/records', 'documents']);

  meetingInfo = computed(() => {
    const { agent } = this.contributor();
    const parts = MEETING_FIELDS
      .filter(key => agent[key] != null)
      .map(key => agent[key] as string);

    return parts.length > 0 ? parts.join(' : ') : null;
  });
}
