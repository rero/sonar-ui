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
import { Component, computed, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../../app-config.service';
import { Identifier } from '../../type/documentType';

/**
 * Component that display an identifier.
 */
@Component({
  selector: 'sonar-record-identifier',
  templateUrl: './identifier.component.html',
  standalone: false
})
export class IdentifierComponent {

  private appConfigService: AppConfigService = inject(AppConfigService);
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
    const settings = this.appConfigService.settings.document_identifier_link;
    const identifier: Identifier = {
      field: this.type(),
      type: this.data().type,
      value: this.data().value
    };
    if (this.data().type in settings) {
      const source = this.data().source ? this.data().source.toLowerCase() : 'default';
      identifier.source = this.data().source;
      if (source in settings[this.data().type]) {
        identifier.link = settings[this.data().type][source]
          .replace('_identifier_', this.data().value);
      }
    }
    return identifier;
  }
}
