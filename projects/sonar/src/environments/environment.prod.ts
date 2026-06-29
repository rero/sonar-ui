// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { _ } from "@ngx-translate/core";

export const environment = {
  production: true,
  projectTitle: _('Swiss Open Access Repository'),
  apiBaseUrl: '',
  $refPrefix: 'https://sonar.ch',
  globalViewName: 'global',
  languages: ['fr', 'de', 'it', 'en'],
  translationsURLs: [
    '/static/node_modules/@rero/sonar-ui/dist/sonar/browser/assets/i18n/${lang}.json',
    '/api/translations/${lang}.json'
  ],
  ngCoreAssetsUrl: '/static/node_modules/@rero/sonar-ui/dist/sonar/browser'
};
