// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { depositTestingService } from 'projects/sonar/tests/utils';
import { DepositService } from '../../deposit/deposit.service';
import { AdminComponent } from './admin.component';
import { MenubarModule } from 'primeng/menubar';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
                provide: BaseTranslateLoader,
                useClass: CoreTranslateLoader,
            }
        }),
        MenubarModule,
        AdminComponent
    ],
    providers: [
        { provide: CoreConfigService, useClass: AppConfigService }, MessageService,
        { provide: DepositService, useValue: depositTestingService },
        provideHttpClient(withInterceptorsFromDi())
    ]
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
