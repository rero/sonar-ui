// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, computed, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { Bind } from '@openng/optimus-ui/bind';
import { Button } from '@openng/optimus-ui/button';
import { ButtonGroup } from '@openng/optimus-ui/buttongroup';
import { Message } from '@openng/optimus-ui/message';
import { Panel } from '@openng/optimus-ui/panel';
import { TableModule } from '@openng/optimus-ui/table';
import { Textarea } from '@openng/optimus-ui/textarea';
import {
  CONFIG,
  Error as CoreError,
  DateTranslatePipe,
  JsonObject,
  Nl2brPipe,
  RecordData,
  RecordService,
} from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, map, startWith } from 'rxjs/operators';

import { validation_action, validation_status } from '../../enum/validation';
import { AppStore, AppStoreType } from '../../store/app.store';

@Component({
  selector: 'sonar-record-validation',
  templateUrl: './validation.component.html',
  imports: [
    Bind,
    Panel,
    Message,
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
  validation = signal<JsonObject | null>(null);
  showLogs = signal(false);

  comment = viewChild<ElementRef>('comment');

  isModerator = computed(() => this.user()?.is_moderator ?? false);
  status = computed(() => this.validation()?.['status'] as validation_status | undefined);
  logs = computed(() => this.validation()?.['logs'] as JsonObject[] | undefined);

  private currentLang = toSignal(
    this.translateService.onLangChange.pipe(
      map((e) => e.lang),
      startWith(this.translateService.getCurrentLang()),
    ),
  );

  translatedStatusMessage = computed(() => {
    this.currentLang();
    const translatedStatus = this.status() ? this.translateService.instant(this.status()!) : '';
    return this.translateService.instant('The record is currently in status "{{ status }}".', {
      status: translatedStatus,
    });
  });
  isOwner = computed(() => this.store.userRefEndpoint() === (this.validation()?.['user'] as JsonObject)?.['$ref']);

  constructor() {
    effect(() => {
      this.validation.set(this.record().metadata.validation as JsonObject);
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

        const validation: JsonObject = { ...this.validation()!, action };
        const commentValue = this.comment()?.nativeElement?.value;
        if (commentValue) {
          validation['comment'] = commentValue;
        } else {
          delete validation['comment'];
        }
        const record = this.record();
        const updated: RecordData = { ...record, metadata: { ...record.metadata, validation } };

        this.recordService
          .update(this.type(), record.id, updated)
          .pipe(finalize(() => this.spinner.hide()))
          .subscribe({
            next: (response: unknown) => {
              this.validation.set((response as RecordData).metadata['validation'] as JsonObject);
              this.messageService.add({
                severity: 'success',
                detail: this.translateService.instant('Review has been done successfully!'),
                life: CONFIG.MESSAGE_LIFE,
              });
            },
            error: (error: CoreError) => {
              this.messageService.add({
                severity: 'error',
                summary: this.translateService.instant('Error'),
                detail: error.title,
                sticky: true,
                closable: true,
              });
            },
          });
      },
    });
  }
}
