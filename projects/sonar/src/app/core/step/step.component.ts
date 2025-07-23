/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { Component, computed, inject, input, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'sonar-deposit-step',
    templateUrl: './step.component.html',
    standalone: false
})
export class StepComponent {

  private translateService: TranslateService = inject(TranslateService);

  /** Current max step, no link available for next steps. */
  maxStep = input.required<string>();

  /** Array of step for deposit process */
  steps = input.required<string[]>();

  items: Signal<MenuItem[]> = computed(() => this.getItems());

  language = toSignal(this.translateService.onLangChange);

  getItems() {
    let disabled = false;
    // the language has been changed
    this.language();
    return this.steps().map((item: string): MenuItem => {
      const data =  {
        label: this.translateService.instant(`step_${item}`),
        routerLink: ['..', item],
        disabled
      };
      if (this.maxStep() === item) {
        disabled = true;
      }
      return data;
    })
  }
}
