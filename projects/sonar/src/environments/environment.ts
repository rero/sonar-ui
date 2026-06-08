/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { _ } from "@ngx-translate/core";

export const environment = {
  production: false,
  projectTitle: _('Swiss Open Access Repository'),
  apiBaseUrl: '',
  $refPrefix: 'https://sonar.ch',
  globalViewName: 'global',
  languages: ['fr', 'de', 'it', 'en'],
  translationsURLs: [
    '/assets/i18n/${lang}.json',
    '/api/translations/${lang}.json'
  ]
};

