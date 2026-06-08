/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Identifier } from '../../type/documentType';
import { AppStore, AppStoreType } from '../../store/app.store';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { UpperCasePipe } from '@angular/common';

/**
 * Component that display an identifier.
 */
@Component({
    selector: 'sonar-record-identifier',
    templateUrl: './identifier.component.html',
    imports: [Bind, Tag, UpperCasePipe, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentifierComponent {

  private store = inject(AppStore) as AppStoreType;
  private translateService: TranslateService = inject(TranslateService);

  /** Type of field (agent, identifiedBy) */
  type = input.required<string>();

  /** Identifier values */
  data = input.required<{ type: string, value: string, source?: string }>();

  identifier = computed(() => this.processData());

  /** Return the title link for external url */
  get externalLinkText(): string {
    return this.translateService.instant('External link to the source');
  }

  /** Process data */
  private processData(): Identifier {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const identifierLink = (this.store.settings()?.document_identifier_link ?? {}) as Record<string, Record<string, string>>;
    const identifier: Identifier = {
      field: this.type(),
      type: this.data().type,
      value: this.data().value
    };
    if (this.data().type in identifierLink) {
      const source = this.data().source ? this.data().source!.toLowerCase() : 'default';
      identifier.source = this.data().source;
      if (source in identifierLink[this.data().type]) {
        identifier.link = identifierLink[this.data().type][source]
          .replace('_identifier_', this.data().value);
      }
    }
    return identifier;
  }
}
