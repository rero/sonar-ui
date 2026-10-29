// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChildren, input } from '@angular/core';
import { PrimeTemplate } from '@openng/optimus-ui/api';

@Component({
  selector: 'sonar-field-description',
  templateUrl: './field-description.component.html',
  imports: [NgTemplateOutlet],
})
export class FieldDescriptionComponent {
  label = input<string>();
  field = input<unknown>();
  type = computed(() => this.getType());

  templates = contentChildren(PrimeTemplate);
  template = computed(() => {
    const result = this.templates().map((template: PrimeTemplate) => {
      switch (template.getType()) {
        case 'template':
          return template.template;
        default:
          return null;
      }
    });
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
