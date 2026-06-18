// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { CoreConfigService, provideCore, RemoteAutocompleteService } from '@rero/ng-core';
import { providePrimeNG } from 'primeng/config';
import { AppConfigService } from './app-config.service';
import { AppTranslateLoader } from './app-translate-loader';
import { AppStore } from './store/app.store';
import { HttpInterceptor } from './interceptor/http.interceptor';
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
    providePrimeNG(primeNGSonarConfig),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true,
    },
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
