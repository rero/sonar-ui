// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';
import { CORE_TRANSLATION_LOADERS, CoreConfigService, CoreTranslateLoader, TranslationLoaderFn } from '@rero/ng-core';

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

@Injectable()
export class AppTranslateLoader extends CoreTranslateLoader {
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
}
