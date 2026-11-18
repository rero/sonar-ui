// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { MenubarModule } from '@openng/optimus-ui/menubar';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { depositTestingService } from 'projects/sonar/tests/utils';

import { AppConfigService } from '../../app-config.service';
import { DepositService } from '../../deposit/deposit.service';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), MenubarModule, AdminComponent],
      providers: [
        provideTranslateService({
          defaultLanguage: 'en',
          loader: {
            provide: BaseTranslateLoader,
            useClass: CoreTranslateLoader,
          },
        }),
        { provide: CoreConfigService, useClass: AppConfigService },
        MessageService,
        { provide: DepositService, useValue: depositTestingService },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    TestBed.inject(TranslateService).use('en');
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
