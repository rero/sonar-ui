// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreTranslateLoader } from '@rero/ng-core';
import { depositTestingService } from 'projects/sonar/tests/utils';
import { DepositService } from './deposit.service';

describe('DepositService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
    imports: [
      TranslateModule.forRoot({
        loader: {
          provide: BaseTranslateLoader,
          useClass: CoreTranslateLoader,
        }
      })
    ],
    providers: [
      { provide: DepositService, useValue: depositTestingService },
      provideHttpClient(withInterceptorsFromDi())
    ]
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const service: DepositService = TestBed.inject(DepositService);
    expect(service).toBeTruthy();
  });
});
