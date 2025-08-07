/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';
import { validation_status } from '../../record/validation/constants';

@Component({
    selector: 'sonar-deposit-review',
    templateUrl: './review.component.html',
    standalone: false
})
export class ReviewComponent implements OnInit, OnDestroy {

  private confirmationService: ConfirmationService = inject(ConfirmationService);
  private userService: UserService = inject(UserService);
  private translateService: TranslateService = inject(TranslateService);
  private depositService: DepositService = inject(DepositService);
  private messageService: MessageService = inject(MessageService);
  private router: Router = inject(Router);

  /** Deposit record */
  @Input() deposit: any = null;

  // Logged user
  user: any;

  // User subscription
  private userSubscription: Subscription;

  /** Used to retrieve value for the comment */
  comment: string;

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  /**
   * Approve the deposit.
   */
  review(action: string, edit: boolean = false): void {
      this.confirmationService.confirm({
        header: this.translateService.instant('deposit_log_action_' + action),
        message: this.translateService.instant('Do you really want to do this action?'),
        closable: false,
        accept: () => {
          this.depositService.reviewDeposit(
            this.deposit,
            action,
            this.comment
          ).subscribe((deposit: any) => {
            this.messageService.add({
              severity: 'success',
              detail: this.translateService.instant('Review has been done successfully!'),
              life: CONFIG.MESSAGE_LIFE,
            });
            if (edit) {
              const documentPid = deposit.document.$ref.split('/').pop();
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
