// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { Tag } from '@openng/optimus-ui/tag';

import { AppStore, AppStoreType } from '../../store/app.store';
import { Identifier } from '../../type/documentType';

/**
 * Component that display an identifier.
 */
@Component({
  selector: 'sonar-record-identifier',
  templateUrl: './identifier.component.html',
  imports: [Bind, Tag, UpperCasePipe, TranslatePipe],
})
export class IdentifierComponent {
  private store = inject(AppStore) as AppStoreType;
  private translateService: TranslateService = inject(TranslateService);

  /** Type of field (agent, identifiedBy) */
  type = input.required<string>();

  /** Identifier values */
  data = input.required<{ type: string; value: string; source?: string }>();

  identifier = computed(() => this.processData());

  /** Return the title link for external url */
  get externalLinkText(): string {
    return this.translateService.instant('External link to the source');
  }

  /** Process data */
  private processData(): Identifier {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const identifierLink = (this.store.settings()?.document_identifier_link ?? {}) as Record<
      string,
      Record<string, string>
    >;
    const identifier: Identifier = {
      field: this.type(),
      type: this.data().type,
      value: this.data().value,
    };
    if (this.data().type in identifierLink) {
      const source = this.data().source ? this.data().source!.toLowerCase() : 'default';
      identifier.source = this.data().source;
      if (source in identifierLink[this.data().type]) {
        identifier.link = identifierLink[this.data().type][source].replace('_identifier_', this.data().value);
      }
    }
    return identifier;
  }
}
