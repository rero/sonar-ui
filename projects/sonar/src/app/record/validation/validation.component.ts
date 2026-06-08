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
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { CONFIG, RecordData, RecordService, DateTranslatePipe, Nl2brPipe } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppStore, AppStoreType } from '../../store/app.store';

import { validation_action, validation_status } from '../../enum/validation';
import { Bind } from 'primeng/bind';
import { Panel } from 'primeng/panel';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';
import { ButtonGroup } from 'primeng/buttongroup';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'sonar-record-validation',
    templateUrl: './validation.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        Bind,
        Panel,
        Message,
        TranslateDirective,
        Textarea,
        ButtonGroup,
        Button,
        TableModule,
        TranslatePipe,
        DateTranslatePipe,
        Nl2brPipe,
    ],
})
export class ValidationComponent {

  private readonly store = inject(AppStore) as AppStoreType;
  private readonly recordService = inject(RecordService);
  private readonly translateService = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly spinner = inject(NgxSpinnerService);

  readonly validationStatus = validation_status;
  readonly validationAction = validation_action;

  record = input.required<RecordData>();
  type = input.required<string>();

  user = this.store.user;
  validation = signal<Record<string, unknown> | null>(null);
  showLogs = signal(false);

  comment = viewChild<ElementRef>('comment');

  isModerator = computed(() => this.user()?.is_moderator ?? false);
  status = computed(() => this.validation()?.['status'] as validation_status | undefined);
  logs = computed(() => this.validation()?.['logs'] as Record<string, unknown>[] | undefined);

  private currentLang = toSignal(
    this.translateService.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translateService.getCurrentLang())
    )
  );

  translatedStatusMessage = computed(() => {
    this.currentLang();
    const translatedStatus = this.status() ? this.translateService.instant(this.status()!) : '';
    return this.translateService.instant(
      'The record is currently in status "{{ status }}".',
      { status: translatedStatus }
    );
  });
  isOwner = computed(() =>
    this.store.getUserRefEndpoint() === (this.validation()?.['user'] as Record<string, unknown>)?.['$ref']
  );

  constructor() {
    effect(() => {
      this.validation.set(this.record().metadata.validation as Record<string, unknown>);
    });
  }

  updateValidation(action: string): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('validation_action_' + action),
      message: this.translateService.instant('Do you really want to do this action?'),
      closable: false,
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.spinner.show();

        const updated: Record<string, unknown> = { ...this.validation()!, action };
        const commentValue = this.comment()?.nativeElement?.value;
        if (commentValue) {
          updated['comment'] = commentValue;
        } else {
          delete updated['comment'];
        }
        this.validation.set(updated);

        this.recordService
          .update(this.type(), this.record().id, this.record())
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .subscribe((record: any) => {
            this.validation.set(record.metadata['validation'] as Record<string, unknown>);
            this.spinner.hide();
            this.messageService.add({
              severity: 'success',
              detail: this.translateService.instant('Review has been done successfully!'),
              life: CONFIG.MESSAGE_LIFE,
            });
          });
      },
    });
  }
}
