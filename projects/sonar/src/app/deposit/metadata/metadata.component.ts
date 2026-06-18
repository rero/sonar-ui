// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { MessageService } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Ripple } from 'primeng/ripple';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { switchMap, tap } from 'rxjs/operators';
import { HighlightJsonPipe } from '../../core/highlight-json.pipe';
import { StepComponent } from '../../core/step/step.component';
import { DepositStore, DepositStoreType } from '../deposit.store';
import { EditorComponent } from '../editor/editor.component';
import { FilesComponent } from '../files/files.component';
import { ReviewComponent } from '../review/review.component';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'sonar-deposit-metadata',
    templateUrl: './metadata.component.html',
    imports: [StepComponent, ReviewComponent, Bind, Tabs, TabList, Ripple, Tab, TabPanels, TabPanel, EditorComponent, FilesComponent, JsonPipe, TranslatePipe, HighlightJsonPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataComponent {

  private messageService = inject(MessageService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  store = inject(DepositStore) as DepositStoreType;
  currentStep = signal<string>('metadata');
  steps = signal<string[]>(['files', 'metadata', 'contributors', 'projects', 'diffusion']);

  constructor() {
    inject(ActivatedRoute).params
      .pipe(
        tap((params) => this.currentStep.set(params['step'])),
        switchMap((params) => this.store.load(params['id'])),
        takeUntilDestroyed()
      )
      .subscribe({
        next: () => {
          if (!this.store.canAccess()) {
            this.router.navigate(['deposit', this.store.deposit()!.pid, 'confirmation']);
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant('Deposit not found'),
            life: CONFIG.MESSAGE_LIFE,
          });
          this.router.navigate(['records', 'deposits']);
        },
      });
  }
}
