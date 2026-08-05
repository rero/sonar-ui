// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { CoreConfigService, NgCoreTranslateService, provideCore, RemoteAutocompleteService } from '@rero/ng-core';
import { providePrimeNG } from 'primeng/config';
import { AppConfigService } from './app-config.service';
import { AppTranslateLoader } from './app-translate-loader';
import { AppTranslateService } from './app-translate.service';
import { AppStore } from './store/app.store';
import { LanguageValuePipe } from './pipe/language-value.pipe';
import { primeNGSonarConfig } from './primeng-config';
import { UIAutocompleteService } from './ui-autocomplete.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideCore(),
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideTranslateService({
      loader: provideTranslateLoader(AppTranslateLoader),
    }),
    { provide: NgCoreTranslateService, useExisting: AppTranslateService },
    providePrimeNG(primeNGSonarConfig),
    provideHttpClient(),
    {
      provide: CoreConfigService,
      useClass: AppConfigService,
    },
    provideAppInitializer(() => (inject(AppStore) as InstanceType<typeof AppStore>).load()),
    {
      provide: RemoteAutocompleteService,
      useClass: UIAutocompleteService,
    },
    DatePipe,
    LanguageValuePipe,
  ],
};
