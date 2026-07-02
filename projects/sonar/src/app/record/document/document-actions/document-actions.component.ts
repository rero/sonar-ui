// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CitationComponent } from '../citation/citation.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sonar-document-actions',
  imports: [],
  templateUrl: './document-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentActionsComponent {

  dialogService = inject(DialogService);
  translateService = inject(TranslateService);

  recordData = input.required<Record<string, unknown>>();

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
