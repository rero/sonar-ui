// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from './app-config.service';
import { AppTranslateLoader } from './app-translate-loader';

describe('AppTranslateLoader', () => {
  it('should be a subclass of CoreTranslateLoader', () => {
    expect(AppTranslateLoader.prototype).toBeInstanceOf(CoreTranslateLoader);
  });

  describe('ngCoreI18n loaders', () => {
    let loader: AppTranslateLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AppTranslateLoader,
          { provide: CoreConfigService, useClass: AppConfigService }
        ]
      });
      loader = TestBed.inject(AppTranslateLoader);
    });

    afterEach(() => vi.restoreAllMocks());

    const cases = [
      { lang: 'de', data: { greeting: 'Hallo' } },
      { lang: 'fr', data: { greeting: 'Bonjour' } },
      { lang: 'it', data: { greeting: 'Ciao' } },
    ] as const;

    it.each(cases)('$lang loader fetches from sonar-ui ng-core assets', async ({ lang, data }) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (loader as any).coreTranslationLoaders[lang]();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/assets/sonar-ui/ng-core/i18n/${lang}.json`)
      );
      expect(result).toEqual({ default: data });
    });

    it.each(cases)('$lang loader returns empty object on HTTP error', async ({ lang }) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (loader as any).coreTranslationLoaders[lang]();

      expect(result).toEqual({ default: {} });
    });

    it.each(cases)('$lang loader returns empty object on network failure', async ({ lang }) => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (loader as any).coreTranslationLoaders[lang]();

      expect(result).toEqual({ default: {} });
    });
  });
});
