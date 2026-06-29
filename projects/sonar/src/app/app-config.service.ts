// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';
import { CoreConfigService } from '@rero/ng-core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService extends CoreConfigService {

  // Current view code
  view: string | null = null;

  globalviewName: string;

  // maximum upload file size
  maxFileSize = 500 * 1024 * 1024;

  // Languages map.
  languagesMap = [
    {
      code: 'en',
      bibCode: 'eng',
    },
    {
      code: 'fr',
      bibCode: 'fre',
    },
    {
      code: 'de',
      bibCode: 'ger',
    },
    {
      code: 'it',
      bibCode: 'ita',
    },
  ];

  settings: { document_identifier_link: unknown } | null = null;

  /**
   * Constructor.
   */
  constructor() {
    super();
    this.production = environment.production;
    this.apiBaseUrl = environment.apiBaseUrl;
    this.$refPrefix = environment.$refPrefix;
    this.globalviewName = environment.globalViewName;
    this.projectTitle = environment.projectTitle;
    this.schemaFormEndpoint = '/schemas';
    this.translationsURLs = environment.translationsURLs;
    this.ngCoreAssetsUrl = environment.ngCoreAssetsUrl ?? '';
  }
}
