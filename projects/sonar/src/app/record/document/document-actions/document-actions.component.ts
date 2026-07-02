// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '@rero/ng-core';
import { ButtonDirective } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { AppStore } from '../../../store/app.store';
import { CitationComponent } from '../citation/citation.component';

@Component({
  selector: 'sonar-document-actions',
  imports: [ButtonDirective, TranslatePipe],
  templateUrl: './document-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentActionsComponent {

  private apiService = inject(ApiService);
  dialogService = inject(DialogService);
  translateService = inject(TranslateService);
  protected store = inject(AppStore);

  recordData = input.required<Record<string, unknown>>();

  exportFormats = computed(() => this.store.settings()?.document_serializers ?? []);

  exportUrl(format: string): string {
    const pid = this.recordData().pid as string;
    return `${this.apiService.getEndpointByType('documents', true)}/${pid}/export/${format}`;
  }

  citation(): void {
    this.dialogService.open(CitationComponent, {
      header: this.translateService.instant('Citation'),
      modal: true,
      data: {
        documentPid: this.recordData().pid,
      },
      closable: true,
      width: '40vw',
      position: 'top',
    });
  }
}
