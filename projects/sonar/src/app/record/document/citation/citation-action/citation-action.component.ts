// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from '@openng/optimus-ui/button';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';

import { CitationComponent } from '../citation.component';

@Component({
  selector: 'sonar-citation-action',
  templateUrl: './citation-action.component.html',
  imports: [Button, TranslatePipe],
})
export class CitationActionComponent {
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
      breakpoints: {
        '960px': '75vw',
        '640px': '95vw',
      },
      position: 'top',
    });
  }
}
