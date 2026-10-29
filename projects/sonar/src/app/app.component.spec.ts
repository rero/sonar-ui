// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';

import { AppConfigService } from './app-config.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), AppComponent],
      providers: [
        provideTranslateService({
          loader: {
            provide: BaseTranslateLoader,
            useClass: CoreTranslateLoader,
          },
        }),
        { provide: CoreConfigService, useClass: AppConfigService },
        MessageService,
        ConfirmationService,
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
