// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Pipe, PipeTransform } from '@angular/core';
import { IContribution } from '../record/document/contribution.interface';

@Pipe({ name: 'contributors' })
export class ContributorsPipe implements PipeTransform {

  /** Sort priority */
  private SORT_CONTRIBUTOR_PRIORITY = ['cre', 'ctb', 'dgs', 'edt', 'prt'];

  /**
   * Transform
   *
   * @param contributors - array of contributions
   * @param meeting - true: extract only meeting, false: extract person and organization
   * @returns array of sorted contributors
   */
  transform(contributors?: IContribution[], meeting = false): IContribution[] {
    if (!contributors) {
      return [];
    }

    contributors = contributors.filter((contributor: IContribution) => {
      if (meeting) {
        return contributor.agent.type === 'bf:Meeting';
      } else {
        return contributor.agent.type !== 'bf:Meeting';
      }
    });

    return contributors.sort(
      (a: IContribution, b: IContribution) => {
        const aIndex = this.SORT_CONTRIBUTOR_PRIORITY.findIndex(
          (role) => a.role[0] === role
        );
        const bIndex = this.SORT_CONTRIBUTOR_PRIORITY.findIndex(
          (role) => b.role[0] === role
        );
        if (aIndex === bIndex) {
          return 0;
        }
        return aIndex < bIndex ? -1 : 1;
      }
    );
  }
}
