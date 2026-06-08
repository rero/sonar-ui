/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
