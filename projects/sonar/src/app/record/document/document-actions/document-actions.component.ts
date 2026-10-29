// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Panel } from '@openng/optimus-ui/panel';
import { ApiService } from '@rero/ng-core';

import { AppStore } from '../../../store/app.store';

@Component({
  selector: 'sonar-document-actions',
  imports: [ButtonDirective, TranslatePipe, Panel],
  templateUrl: './document-actions.component.html',
})
export class DocumentActionsComponent {
  private apiService = inject(ApiService);
  protected store = inject(AppStore);

  recordData = input.required<Record<string, unknown>>();

  exportFormats = computed(() => this.store.settings()?.document_serializers ?? []);

  exportUrl(format: string): string {
    const pid = this.recordData().pid as string;
    return `${this.apiService.getEndpointByType('documents', true)}/${pid}?format=${format}`;
  }
}
