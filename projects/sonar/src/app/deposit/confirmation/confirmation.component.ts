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
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppStore, AppStoreType } from '../../store/app.store';
import { DepositService } from '../deposit.service';
import { Bind } from 'primeng/bind';
import { Message } from 'primeng/message';

@Component({
    selector: 'sonar-deposit-confirmation',
    templateUrl: './confirmation.component.html',
    imports: [Bind, Message, TranslateDirective, RouterLink, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
      })
    )
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
    return this.store.getPublicInterfaceLink();
  }
}
