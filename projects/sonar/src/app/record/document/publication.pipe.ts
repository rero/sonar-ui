// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

type PartOf = {
  document?: { title?: string };
  numberingYear?: string;
  numberingVolume?: string;
  numberingIssue?: string;
  numberingPages?: string;
}

/**
 * Pipe for displaying publication for a document
 */
@Pipe({ name: 'publication' })
export class PublicationPipe implements PipeTransform {

  private translateService: TranslateService = inject(TranslateService);

  /**
   * Transform `partOf` object in text.
   *
   * @param value `partOf` object.
   * @returns Text representing the publication.
   */
  transform(value: PartOf): string {
    const journal: string[] = [];

    if (value.document && value.document.title) {
      journal.push(value.document.title);
    }

    if (value.numberingYear) {
      journal.push(value.numberingYear);
    }

    if (value.numberingVolume) {
      journal.push(
        this.translateService.instant('vol.') + ' ' + value.numberingVolume
      );
    }

    if (value.numberingIssue) {
      journal.push(
        this.translateService.instant('no.') + ' ' + value.numberingIssue
      );
    }

    if (value.numberingPages) {
      journal.push(
        this.translateService.instant('p.') + ' ' + value.numberingPages
      );
    }

    return journal.join(', ');
  }
}
