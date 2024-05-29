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
import { AfterContentInit, Component, ContentChildren, QueryList, TemplateRef, computed, input } from '@angular/core';
import { PrimeTemplate } from 'primeng/api';
import { Nullable } from 'primeng/ts-helpers';

@Component({
    selector: 'sonar-field-description',
    templateUrl: './field-description.component.html',
    standalone: false
})
export class FieldDescriptionComponent implements AfterContentInit {
  label = input<string>();
  field = input<any>();
  type = computed(() => this.getType());
  template: Nullable<TemplateRef<any>>;

  @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate> | null;

  ngAfterContentInit() {
    (this.templates as QueryList<PrimeTemplate>).forEach((item) => {
        switch (item.getType()) {
            case 'template':
                this.template = item.template;
                break;
        }
      });
    }
    getType() {
      const field = this.field();
      if (Array.isArray(field)) {
        return 'array';
      }
      return typeof field;
    }
}
