// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en-GB';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

registerLocaleData(localeDe, 'de');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
