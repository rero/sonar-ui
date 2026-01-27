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
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { VALIDATION_STATUS_SEVERITY } from '../../enum/validation';
import { UserService } from '../../user.service';

@Component({
  selector: 'sonar-deposit-brief-view',
  templateUrl: './brief-view.component.html',
  standalone: false
})
export class BriefViewComponent implements OnInit, OnDestroy {

  private userService: UserService = inject(UserService);

  record: any;
  user: any;

  historyDialogVisible = signal(false);

  canContinueProcess = computed(() => {
    if((['in_progress', 'ask_for_changes'].includes(this.record.metadata.status))) {
      return this.userService.checkUserPid(this.record.metadata.user.pid);
    };
    return false;
  });

  canReview = computed(() => this.record.metadata.status !== 'to_validate'
    ? false
    : this.user && this.user.is_moderator
  );

  canAccessToDocumentRedirect = computed(() =>
    this.userService.hasRole(['moderator', 'admin', 'superuser'])
  );

  get statusSeverity(): string | null {
    return this.record?.metadata?.status
      ? VALIDATION_STATUS_SEVERITY[this.record.metadata.status]
      : null;
  }

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(this.userService.user$.subscribe((user) => {
      this.user = user;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
