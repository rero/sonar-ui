// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActionStatus, ApiService } from '@rero/ng-core';
import type { RecordData } from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import { AppStore } from '../store/app.store';

@Injectable({ providedIn: 'root' })
export class RouteToolService {

  injector: Injector = inject(Injector);

  get translateService(): TranslateService {
    return this.injector.get(TranslateService);
  }

  get apiService(): ApiService {
    return this.injector.get(ApiService);
  }

  get activatedRoute(): ActivatedRoute {
    return this.injector.get(ActivatedRoute);
  }

  get appStore(): InstanceType<typeof AppStore> {
    return this.injector.get(AppStore as unknown as new () => InstanceType<typeof AppStore>);
  }

  can(message = ''): Observable<ActionStatus> {
    return of({ can: true, message });
  }

  canNot(message = ''): Observable<ActionStatus> {
    return of({ can: false, message });
  }

  canAccess(resource: string, action: string, record: RecordData | null = null): Observable<ActionStatus> {
    if (record) {
      const meta = record.metadata as Record<string, Record<string, boolean>> | undefined;
      const can = meta?.['permissions']?.[action] ?? false;
      return of({ can, message: can ? '' : this.translateService.instant('You cannot delete this record.') });
    }
    const permissions = this.appStore.permissions();
    const can = permissions?.[resource]?.[action] ?? false;
    return of({ can, message: can ? '' : this.translateService.instant('You cannot delete this record.') });
  }
}
