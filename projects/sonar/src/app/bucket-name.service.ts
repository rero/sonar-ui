// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Bucket, IFilter, RecordService } from '@rero/ng-core';
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

  /**
   * Resolve the label of an aggregation value.
   *
   * Used for both the facet entries (`processBucketName`) and the selected filter
   * buttons (`processFilterName`), so that the same value is always displayed the same
   * way. Only the fields shared by `Bucket` and `IFilter` are read.
   *
   * @param item Bucket or selected filter to name.
   * @returns Observable resolving the label, kept up to date on a language change.
   */
  transform(item: Bucket | IFilter): Observable<string> {
    if(item.name) { return of(item.name); }
    switch (item.aggregationKey) {
      case 'language': return this.translateService.stream(`lang_${item.key}`);
      case 'document_type': return this.translateService.stream(`document_type_${item.key}`);
      case 'status': return this.translateService.stream(`deposit_status_${item.key}`);
      case 'subdivision': return this.resolveRecordName('subdivisions', item.key);
      case 'collection':
      case 'collection_view': return this.resolveRecordName('collections', item.key);
      default: return this.translateService.stream(item.key);
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
