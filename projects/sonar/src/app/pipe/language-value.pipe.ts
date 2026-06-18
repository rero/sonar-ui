// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

/**
 * Return the value of source array, corresponding of given language.
 */
@Pipe({ name: 'languageValue' })
export class LanguageValuePipe implements PipeTransform {

  private translateService: TranslateService = inject(TranslateService);

  transform(value: Record<string, string>[], ...args: string[]): Observable<string> {
    if (!value || value.length === 0) {
      return of('');
    }

    if (!args[0]) {
      args[0] = 'value';
    }

    if (!args[1]) {
      args[1] = 'language';
    }

    const languageMap = {
      fr: 'fre',
      en: 'eng',
      de: 'ger',
      it: 'ita',
    };

    return this.translateService.onLangChange.pipe(
      startWith({ lang: this.translateService.currentLang }),
      map((event: LangChangeEvent) => {
        if (!languageMap[event.lang]) {
          return value[0][args[0]];
        }

        const itemFound = value.find(
          (element) => element[args[1]] === languageMap[event.lang]
        );

        if (itemFound) {
          return itemFound[args[0]];
        }

        return value[0][args[0]];
      })
    );
  }
}
