// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CoreConfigService } from '@rero/ng-core';
import { of } from 'rxjs';
import { AppConfigService } from '../src/app/app-config.service';
import { DepositService } from '../src/app/deposit/deposit.service';

export const depositTestingService = {
  getJsonSchema: vi.fn().mockReturnValue(of({ type: 'object', properties: {} })),
  getFiles: vi.fn().mockReturnValue(of({})),
  get: vi.fn().mockReturnValue(of({})),
};

export const mockedConfiguration = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClientTesting(),
    { provide: DepositService, useValue: depositTestingService },
    { provide: CoreConfigService, useClass: AppConfigService },
  ],
};
