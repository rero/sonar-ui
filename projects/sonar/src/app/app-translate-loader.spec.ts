// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { firstValueFrom, of } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AppTranslateLoader, withCustomFieldLabels } from './app-translate-loader';
import { UserOrganisation } from './models';
import { AppStore } from './store/app.store';

const organisation = {
  code: 'org',
  documentsCustomField1: {
    includeInFacets: true,
    label: [
      { language: 'fre', value: 'Étendue' },
      { language: 'eng', value: 'Scope' },
    ],
  },
  documentsCustomField2: { includeInFacets: false },
} as UserOrganisation;

const appStoreMock = { organisation: signal<UserOrganisation | null>(null) };

describe('AppTranslateLoader', () => {
  it('should be a subclass of CoreTranslateLoader', () => {
    expect(AppTranslateLoader.prototype).toBeInstanceOf(CoreTranslateLoader);
  });

  describe('withCustomFieldLabels', () => {
    it('should override the custom field translations with the organisation label', () => {
      const translations = withCustomFieldLabels({}, organisation, 'fre');

      expect(translations['Custom field 1']).toBe('Étendue');
      expect(translations['customField1']).toBe('Étendue');
    });

    it('should fall back on the first label when the language is not available', () => {
      const translations = withCustomFieldLabels({}, organisation, 'ita');

      expect(translations['Custom field 1']).toBe('Étendue');
    });

    it('should keep the translated title when no label is configured', () => {
      const translations = withCustomFieldLabels(
        { 'Custom field 2': 'Champ personnalisé 2' },
        organisation,
        'fre'
      );

      expect(translations['Custom field 2']).toBe('Champ personnalisé 2');
      expect(translations['customField2']).toBe('Champ personnalisé 2');
    });

    it('should name the facet even without translation, for each custom field', () => {
      const translations = withCustomFieldLabels({}, null, 'fre');

      expect(translations['customField1']).toBe('Custom field 1');
      expect(translations['customField2']).toBe('Custom field 2');
      expect(translations['customField3']).toBe('Custom field 3');
    });

    it('should not alter the given translations', () => {
      const translations = { Deposit: 'Dépôt' };

      expect(withCustomFieldLabels(translations, organisation, 'fre')['Deposit']).toBe('Dépôt');
      expect(translations['customField1']).toBeUndefined();
    });
  });

  describe('getTranslation', () => {
    let loader: AppTranslateLoader;

    beforeEach(() => {
      appStoreMock.organisation.set(organisation);
      TestBed.configureTestingModule({
        providers: [
          AppTranslateLoader,
          { provide: CoreConfigService, useClass: AppConfigService },
          { provide: AppStore, useValue: appStoreMock },
        ]
      });
      loader = TestBed.inject(AppTranslateLoader);
      vi.spyOn(CoreTranslateLoader.prototype, 'getTranslation').mockReturnValue(of({ Deposit: 'Dépôt' }));
    });

    afterEach(() => vi.restoreAllMocks());

    it('should apply the custom field labels of the language', async () => {
      const translations = await firstValueFrom(loader.getTranslation('fr'));

      expect(translations['Deposit']).toBe('Dépôt');
      expect(translations['Custom field 1']).toBe('Étendue');
      expect(translations['customField1']).toBe('Étendue');
    });

    it('should apply the custom field labels for another language', async () => {
      const translations = await firstValueFrom(loader.getTranslation('en'));

      expect(translations['Custom field 1']).toBe('Scope');
    });
  });

  describe('ngCoreI18n loaders', () => {
    let loader: AppTranslateLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AppTranslateLoader,
          { provide: CoreConfigService, useClass: AppConfigService },
          { provide: AppStore, useValue: appStoreMock },
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
