/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';

@Component({
    selector: 'sonar-deposit-confirmation',
    templateUrl: './confirmation.component.html',
    standalone: false
})
export class ConfirmationComponent implements OnInit {

  private messageService: MessageService = inject(MessageService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private depositService: DepositService = inject(DepositService);
  private router: Router = inject(Router);
  private translateService: TranslateService = inject(TranslateService);
  private userService: UserService = inject(UserService);

  deposit$: Observable<any> = null;

  /**
   * Component initialization
   *
   * Gets the deposit data.
   */
  ngOnInit() {
    this.deposit$ = this.route.params.pipe(
      switchMap((params) => {
        return this.depositService.get(params.id);
      }),
      map((result) => result.metadata),
      catchError(() => {
        this.messageService.add({
          severity: 'success',
          detail: this.translateService.instant('Deposit not found'),
          life: CONFIG.MESSAGE_LIFE,
        });
        this.router.navigate(['records', 'deposits']);
        return of(null);
      })
    );
  }

  /**
   * Check if logged user is a submitter
   */
  get isSubmitter(): boolean {
    return this.userService.hasRole('submitter');
  }

  /**
   * Return the link to public interface, depending on user's organisation.
   *
   * @returns Link to public interface.
   */
   get publicInterfaceLink(): string {
    return this.userService.getPublicInterfaceLink();
  }
}
