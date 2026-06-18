// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CoreConfigService } from '@rero/ng-core';
import { AppConfigService } from './app-config.service';
import { UIAutocompleteService } from './ui-autocomplete.service';

describe('UIAutocompleteService', () => {
  let service: UIAutocompleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        { provide: CoreConfigService, useClass: AppConfigService },
      ]
    });
    service = TestBed.inject(UIAutocompleteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
