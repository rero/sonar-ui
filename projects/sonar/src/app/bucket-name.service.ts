/*
 * SONAR User Interface
 * Copyright (C) 2025 RERO
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
import { TranslateService } from '@ngx-translate/core';
import { IBucketNameService, RecordService } from '@rero/ng-core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BucketNameService implements IBucketNameService {

  private translateService: TranslateService = inject(TranslateService);
  private recordService: RecordService = inject(RecordService);

  private languageMap = {
    fr: 'fre',
    en: 'eng',
    de: 'ger',
    it: 'ita',
  };

  transform(aggregationKey: string, value: string): Observable<string> {
    switch (aggregationKey) {
      case 'language': return this.translateService.stream(`lang_${value}`);
      case 'collection_view': return this.recordService.getRecord('collections', value).pipe(
        map((record: any) => {
          if (('name' in record.metadata) && Object.keys(this.languageMap).includes(this.translateService.currentLang)) {
            const encodedLanguage = this.languageMap[this.translateService.currentLang];
            const translatedLanguage = record.metadata.name.filter(
              (langData: { language: string, value: string }) => langData.language === encodedLanguage
            );
            if (translatedLanguage.length === 1) {
              return translatedLanguage[0].value;
            }
          }
          return record.metadata.label;
        })
      );
      default: return this.translateService.stream(value);
    }
  }
}
