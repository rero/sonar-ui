// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { DatePipe } from '@angular/common';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { provideOptimus } from '@openng/optimus-ui/config';
import { CoreConfigService, NgCoreTranslateService, provideCore } from '@rero/ng-core';

import { AppConfigService } from './app-config.service';
import { AppTranslateLoader } from './app-translate-loader';
import { AppTranslateService } from './app-translate.service';
import { routes } from './app.routes';
import { optimusUISonarConfig } from './optimus-ui-config';
import { LanguageValuePipe } from './pipe/language-value.pipe';
import { AppStore } from './store/app.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideCore(),
    provideRouter(routes),
    provideTranslateService({
      loader: provideTranslateLoader(AppTranslateLoader),
    }),
    { provide: NgCoreTranslateService, useExisting: AppTranslateService },
    provideOptimus(optimusUISonarConfig),
    provideHttpClient(withXhr()),
    {
      provide: CoreConfigService,
      useClass: AppConfigService,
    },
    provideAppInitializer(() => (inject(AppStore) as InstanceType<typeof AppStore>).load()),
    DatePipe,
    LanguageValuePipe,
  ],
};
