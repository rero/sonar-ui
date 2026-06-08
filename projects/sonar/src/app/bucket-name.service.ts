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
import { Bucket, RecordService } from '@rero/ng-core';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BucketNameService {

  private translateService: TranslateService = inject(TranslateService);
  private recordService: RecordService = inject(RecordService);

  private languageMap = {
    fr: 'fre',
    en: 'eng',
    de: 'ger',
    it: 'ita',
  };

  transform(bucket: Bucket): Observable<string> {
    if(bucket.name) { return of(bucket.name); }
    switch (bucket.aggregationKey) {
      case 'language': return this.translateService.stream(`lang_${bucket.key}`);
      case 'document_type': return this.translateService.stream(`document_type_${bucket.key}`);
      case 'subdivision': return this.resolveRecordName('subdivisions', bucket.key);
      case 'collection':
      case 'collection_view': return this.resolveRecordName('collections', bucket.key);
      default: return this.translateService.stream(bucket.key);
    }
  }

  private resolveRecordName(type: string, pid: string): Observable<string> {
    return this.recordService.getRecord(type, pid).pipe(
      map((record: { metadata: { name?: { language: string; value: string }[]; label?: string } }) => {
        const currentLang = this.translateService.getCurrentLang();
        if (record.metadata.name && (currentLang in this.languageMap)) {
          const encodedLanguage = this.languageMap[currentLang as keyof typeof this.languageMap];
          const match = record.metadata.name.find(
            (langData: { language: string; value: string }) => langData.language === encodedLanguage
          );
          if (match) return match.value;
        }
        return record.metadata.label ?? pid;
      })
    );
  }
}
