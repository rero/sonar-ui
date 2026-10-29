// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { Bind } from '@openng/optimus-ui/bind';
import { Message } from '@openng/optimus-ui/message';
import { CONFIG } from '@rero/ng-core';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AppStore, AppStoreType } from '../../store/app.store';
import { DepositService } from '../deposit.service';

@Component({
  selector: 'sonar-deposit-confirmation',
  templateUrl: './confirmation.component.html',
  imports: [Bind, Message, RouterLink, TranslatePipe],
})
export class ConfirmationComponent {
  private messageService: MessageService = inject(MessageService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private depositService: DepositService = inject(DepositService);
  private router: Router = inject(Router);
  private translateService: TranslateService = inject(TranslateService);
  private store = inject(AppStore) as AppStoreType;

  deposit = toSignal(
    this.route.params.pipe(
      switchMap((params) => this.depositService.get(params.id)),
      map((result) => result.metadata),
      catchError(() => {
        this.messageService.add({
          severity: 'success',
          detail: this.translateService.instant('Deposit not found'),
          life: CONFIG.MESSAGE_LIFE,
        });
        this.router.navigate(['records', 'deposits']);
        return of(null);
      }),
    ),
  );

  /**
   * Check if logged user is a submitter
   */
  get isSubmitter(): boolean {
    return this.store.hasRole('submitter');
  }

  /**
   * Return the link to public interface, depending on user's organisation.
   *
   * @returns Link to public interface.
   */
  get publicInterfaceLink(): string {
    return this.store.publicInterfaceLink();
  }
}
