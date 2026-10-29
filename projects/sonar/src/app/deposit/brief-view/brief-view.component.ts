// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { TableModule } from '@openng/optimus-ui/table';
import { Tag } from '@openng/optimus-ui/tag';
import { DateTranslatePipe, DetailUrl, Nl2brPipe, RecordData, TruncateTextPipe } from '@rero/ng-core';

import { VALIDATION_STATUS_SEVERITY } from '../../enum/validation';
import { AppStore, AppStoreType } from '../../store/app.store';
import { TagSeverity } from '../../type/tagSeverityType';

@Component({
  selector: 'sonar-deposit-brief-view',
  templateUrl: './brief-view.component.html',
  imports: [
    Bind,
    Button,
    Dialog,
    TableModule,
    Tag,
    RouterLink,
    TranslatePipe,
    DateTranslatePipe,
    Nl2brPipe,
    TruncateTextPipe,
  ],
})
export class BriefViewComponent {
  private store = inject(AppStore) as AppStoreType;

  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();

  user = this.store.user;

  historyDialogVisible = signal(false);

  private depositMetadata = computed(() => this.record().metadata as Record<string, unknown>);

  canContinueProcess = computed(() => {
    const meta = this.depositMetadata();
    if (['in_progress', 'ask_for_changes'].includes(meta.status as string)) {
      return this.store.checkUserPid((meta.user as Record<string, unknown>).pid as string);
    }
    return false;
  });

  canReview = computed(() => this.depositMetadata().status === 'to_validate' && !!this.user()?.is_moderator);

  canAccessToDocumentRedirect = computed(() => this.store.hasRole(['moderator', 'admin', 'superuser']));

  statusSeverity = computed(() => {
    const status = this.depositMetadata()?.status as string | undefined;
    return (status ? VALIDATION_STATUS_SEVERITY[status] : null) as TagSeverity;
  });
}
