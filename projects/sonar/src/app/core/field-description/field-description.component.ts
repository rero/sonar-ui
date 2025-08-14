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
import { Component, computed, contentChildren, input } from '@angular/core';
import { PrimeTemplate } from 'primeng/api';

@Component({
  selector: 'sonar-field-description',
  templateUrl: './field-description.component.html',
  standalone: false
})
export class FieldDescriptionComponent {
  label = input<string>();
  field = input<any>();
  type = computed(() => this.getType());

  templates = contentChildren(PrimeTemplate);
  template = computed(() => {
    const result = this.templates().map((template: PrimeTemplate) => {
        switch(template.getType()) {
          case 'template':
            return template.template;
          default:
            return null;
        }
      }
    );
    return result.length > 0 ? result[0] : null;
  });

  getType() {
    const field = this.field();
    if (Array.isArray(field)) {
      return 'array';
    }
    return typeof field;
  }
}
