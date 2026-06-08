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
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { DateTranslatePipe, DetailUrl, Nl2brPipe, RecordData, TruncateTextPipe } from '@rero/ng-core';
import { TagSeverity } from '../../type/tagSeverityType';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { VALIDATION_STATUS_SEVERITY } from '../../enum/validation';
import { AppStore, AppStoreType } from '../../store/app.store';

@Component({
    selector: 'sonar-deposit-brief-view',
    templateUrl: './brief-view.component.html',
    imports: [Bind, Button, Dialog, TableModule, TranslateDirective, Tag, RouterLink, TranslatePipe, DateTranslatePipe, Nl2brPipe, TruncateTextPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
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

  canReview = computed(() =>
    this.depositMetadata().status === 'to_validate' && !!this.user()?.is_moderator
  );

  canAccessToDocumentRedirect = computed(() =>
    this.store.hasRole(['moderator', 'admin', 'superuser'])
  );

  statusSeverity = computed(() => {
    const status = this.depositMetadata()?.status as string | undefined;
    return (status ? VALIDATION_STATUS_SEVERITY[status] : null) as TagSeverity;
  });
}
