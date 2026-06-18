// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { StepComponent } from '../../core/step/step.component';
import { UploadFilesComponent } from '../../record/files/upload-files/upload-files.component';
import { DepositStore, DepositStoreType } from '../deposit.store';

@Component({
    selector: 'sonar-deposit-upload',
    templateUrl: './upload.component.html',
    imports: [StepComponent, Bind, Button, RouterLink, UploadFilesComponent, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadComponent {

  private store = inject(DepositStore) as DepositStoreType;
  private router = inject(Router);
  private spinner = inject(NgxSpinnerService);

  deposit = this.store.deposit;
  maxStep = this.store.maxStep;

  constructor() {
    const route = inject(ActivatedRoute);
    if (route.snapshot.data['mode'] === 'create') {
      this.createEmptyDeposit();
    } else if (route.snapshot.params?.id) {
      this.spinner.show();
      this.store.load(route.snapshot.params.id)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => {
            this.spinner.hide();
            if (!this.store.canAccess()) {
              this.router.navigate(['deposit', this.store.deposit()!.pid, 'confirmation']);
            }
          },
          error: () => this.spinner.hide(),
        });
    }
  }

  createEmptyDeposit(): void {
    this.store.create()
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.router.navigate(['deposit', result.metadata.pid, 'files']);
      });
  }

  saveAndContinue(event: Event): void {
    event.preventDefault();
    const deposit = this.deposit();
    if (deposit) {
      this.router.navigate(['deposit', deposit.pid, 'metadata']);
    }
  }
}
