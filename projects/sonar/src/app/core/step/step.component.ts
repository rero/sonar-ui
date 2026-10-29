// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, computed, inject, input, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Bind } from '@openng/optimus-ui/bind';
import { Divider } from '@openng/optimus-ui/divider';
import { Steps } from '@openng/optimus-ui/steps';

@Component({
  selector: 'sonar-deposit-step',
  templateUrl: './step.component.html',
  imports: [Steps, Bind, Divider],
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
      const data = {
        label: this.translateService.instant(`step_${item}`),
        routerLink: ['..', item],
        disabled,
      };
      if (this.maxStep() === item) {
        disabled = true;
      }
      return data;
    });
  }
}
