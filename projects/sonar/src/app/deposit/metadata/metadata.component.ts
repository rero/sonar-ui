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
import { TranslateService } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { MessageService } from 'primeng/api';
import { combineLatest } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { DepositService } from '../deposit.service';

@Component({
  selector: 'sonar-deposit-metadata',
  templateUrl: './metadata.component.html',
  standalone: false
})
export class MetadataComponent implements OnInit {

  private messageService: MessageService = inject(MessageService);
  private depositService: DepositService = inject(DepositService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private translateService: TranslateService = inject(TranslateService);

  /** Deposit object */
  deposit = signal<any>(null);

  /** Current form to show */
  currentStep = signal<string>('metadata');

  /** Deposit steps */
  steps = signal<string[]>([
    'files',
    'metadata',
    'contributors',
    'projects',
    'diffusion',
  ]);

  /** Store files associated with deposit */
  private files = signal<any[]>([]);
  mainFile = computed(() => this.files().length > 0? this.files()[0]: null);
  /** Return additional files list */
  additionalFiles = computed(() => this.files().slice(1));
  maxStep = computed(() => this.deposit() ? this.deposit().step : 'metadata');

  ngOnInit(): void {
    this.route.params
      .pipe(
        tap((params) => {
          this.currentStep.set(params.step);
        }),
        switchMap((params) => this.depositService.get(params.id))
      )
      .subscribe({
        next: (result) => {
          this.deposit.set(result.metadata);

          // TODO: solve this
          if (this.depositService.canAccessDeposit(this.deposit()) === false) {
            this.router.navigate([
              'deposit',
              this.deposit().pid,
              'confirmation',
            ]);
          }
          const files = [...result.metadata._files || []];
          files.sort((a, b) => a.order - b.order);
          this.files.set(files);
        },
        error: () => {
          this.messageService.add({
            severity: 'success',
            detail: this.translateService.instant('Deposit not found'),
            life: CONFIG.MESSAGE_LIFE,
          });
          this.router.navigate(['records', 'deposits']);
        }
      }
      );
  }
  updateDeposit(value) {
    this.deposit.set(value);
  }

}
