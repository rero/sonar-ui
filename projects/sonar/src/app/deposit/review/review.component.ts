// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { Panel } from 'primeng/panel';
import { Textarea } from 'primeng/textarea';
import { validation_status } from '../../enum/validation';
import { Deposit } from '../../models';
import { AppStore, AppStoreType } from '../../store/app.store';
import { DepositStore, DepositStoreType } from '../deposit.store';

@Component({
    selector: 'sonar-deposit-review',
    templateUrl: './review.component.html',
    imports: [Bind, Panel, ReactiveFormsModule, Textarea, FormsModule, Button, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewComponent {

  private confirmationService = inject(ConfirmationService);
  private translateService = inject(TranslateService);
  private store = inject(DepositStore) as DepositStoreType;
  private messageService = inject(MessageService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  deposit = input.required<Deposit>();
  user = (inject(AppStore) as AppStoreType).user;
  comment = signal<string | undefined>(undefined);

  review(action: string, edit = false): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('deposit_log_action_' + action),
      message: this.translateService.instant('Do you really want to do this action?'),
      closable: false,
      accept: () => {
        this.store.reviewDeposit(this.deposit(), action, this.comment())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((result: unknown) => {
            const deposit = result as Deposit;
            this.messageService.add({
              severity: 'success',
              detail: this.translateService.instant('Review has been done successfully!'),
              life: CONFIG.MESSAGE_LIFE,
            });
            if (edit) {
              const documentPid = deposit.document?.$ref.split('/').pop();
              this.router.navigate(['records', 'documents', 'detail', documentPid]);
            } else {
              this.router.navigate(['records', 'deposits'], {
                queryParams: { status: validation_status.TO_VALIDATE }
              });
            }
          });
      }
    });
  }
}
