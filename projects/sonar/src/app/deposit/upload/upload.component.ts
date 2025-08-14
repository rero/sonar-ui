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
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';
import { DepositService } from '../deposit.service';

@Component({
    selector: 'sonar-deposit-upload',
    templateUrl: './upload.component.html',
    standalone: false
})
export class UploadComponent implements OnInit {

  private depositService = inject(DepositService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private spinner = inject(NgxSpinnerService);

  deposit = signal(null);
  maxStep = computed(() => this.deposit() ? this.deposit().step : 'metadata');

  ngOnInit(): void {
    if (this.route.snapshot.routeConfig.path == 'deposit/create') {
      this.createEmptyDeposit();
    } else if (this.route.snapshot?.params?.id) {
      this.depositService
        .get(this.route.snapshot.params.id)
        .pipe(
          tap((result) => {
            this.spinner.show();
            this.deposit.set(result.metadata);
            if (this.depositService.canAccessDeposit(this.deposit()) === false) {
              this.router.navigate([
                'deposit',
                this.deposit().pid,
                'confirmation',
              ]);
            }
          })
        )
        .subscribe(() => this.spinner.hide());
    }
  }

  /**
   * Create a deposit without associated files.
   * @param event - Event
   */
  createEmptyDeposit(): void {
    this.depositService.create().subscribe((deposit: any) => {
      this.router.navigate(['deposit', deposit.id, 'files']);
    });
  }

  /**
   * Save files metadata and go to next step.
   * @param event Dom event
   */
  saveAndContinue(event: Event): void {
    event.preventDefault();
    this.router.navigate(['deposit', this.deposit().pid, 'metadata']);
  }
}
