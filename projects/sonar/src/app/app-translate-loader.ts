// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';
import { TranslationObject } from '@ngx-translate/core';
import { CORE_TRANSLATION_LOADERS, CoreConfigService, CoreTranslateLoader, TranslationLoaderFn } from '@rero/ng-core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { UserOrganisation } from './models';
import { AppStore, AppStoreType } from './store/app.store';

const ngCoreI18n = (base: string, lang: string): TranslationLoaderFn =>
  () => fetch(`${base}/assets/sonar-ui/ng-core/i18n/${lang}.json`)
    .then(r => {
      if (!r.ok) {
        throw new Error(`Failed to load ${lang} translations: ${r.status}`);
      }
      return r.json();
    })
    .then((data: Record<string, string>) => ({ default: data }))
    .catch((error: unknown) => {
      console.error(error);
      return { default: {} };
    });

/**
 * Override the custom field translations with the labels configured on the organisation.
 *
 * Two keys are overridden for each custom field:
 * - `Custom field {index}`: title of the field in the JSON schemas, used by the document
 *   and the deposit editors, as well as by the document detail view.
 * - `customField{index}`: key of the aggregation, used as facet label.
 *
 * @param translations Translations loaded for the language.
 * @param organisation Organisation of the current logged user, if any.
 * @param bibLanguage Bibliographic code (3 chars) of the language to translate to.
 * @returns The translations, with the custom field labels applied.
 */
export function withCustomFieldLabels(
  translations: TranslationObject,
  organisation: UserOrganisation | null,
  bibLanguage?: string
): TranslationObject {
  const result = { ...translations };

  // Indexes of the custom fields configurable on an organisation.
  ([1, 2, 3] as const).forEach((index) => {
    const label = organisation?.[`documentsCustomField${index}`]?.label;
    const value = label?.find((item) => item.language === bibLanguage)?.value ?? label?.[0]?.value;
    if (value) {
      result[`Custom field ${index}`] = value;
    }
    // The aggregation key is not translatable by itself, fall back on the generic title.
    result[`customField${index}`] = value ?? result[`Custom field ${index}`] ?? `Custom field ${index}`;
  });

  return result;
}

@Injectable()
export class AppTranslateLoader extends CoreTranslateLoader {
  private appConfigService = inject(AppConfigService);
  private appStore = inject(AppStore) as AppStoreType;

  constructor() {
    super();
    const base = inject(CoreConfigService).ngCoreAssetsUrl ?? '';
    this.coreTranslationLoaders = {
      ...CORE_TRANSLATION_LOADERS,
      de: ngCoreI18n(base, 'de'),
      fr: ngCoreI18n(base, 'fr'),
      it: ngCoreI18n(base, 'it'),
    };
  }

  /**
   * The organisation of the logged user is loaded by the application initializer, before
   * the first language is used, and stays the same for the whole session.
   */
  override getTranslation(lang: string): Observable<TranslationObject> {
    const bibLanguage = this.appConfigService.languagesMap.find((item) => item.code === lang)?.bibCode;
    return super.getTranslation(lang).pipe(
      map((translations) => withCustomFieldLabels(translations, this.appStore.organisation(), bibLanguage))
    );
  }
}
