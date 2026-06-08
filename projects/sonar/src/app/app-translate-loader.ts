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
import { inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CoreTranslateLoader as NgCoreTranslateLoader } from '@rero/ng-core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { AppStore } from './store/app.store';
import { UserOrganisation } from './models';

@Injectable({
  providedIn: 'root',
})
export class AppTranslateLoader extends NgCoreTranslateLoader {

  protected coreConfigService: AppConfigService = inject(AppConfigService);
  private readonly store = inject(AppStore);
  private readonly organisation$ = toObservable(this.store.organisation);

  getTranslation(lang: string): Observable<Record<string, string>> {
    const sources: [Observable<UserOrganisation | null>, Observable<Record<string, string>>] = [
      this.organisation$,
      super.getTranslation(lang) as Observable<Record<string, string>>,
    ];
    return combineLatest(sources).pipe(
      map(([organisation, translation]) => {
        if (organisation) {
          const bibLanguage = this.coreConfigService.languagesMap.find(
            (mapping: {code: string, bibCode: string}) => mapping.code === lang
          )?.bibCode;
          [1, 2, 3].forEach((id: number) => {
            const key = `documentsCustomField${id}`;
            if ((key in organisation) && ('label' in (organisation[key] as Record<string, unknown>))) {
              const { label } = organisation[key] as { label: { language: string; value: string }[] };
              const entry = label.find((lab) => lab.language === bibLanguage);
              const value = entry ? entry.value : label[0].value;
              translation[`Custom field ${id}`] = value;
              translation[`customField${id}`] = value;
            }
          });
        }
        return translation;
      })
    );
  }
}
