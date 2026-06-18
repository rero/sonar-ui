// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { depositTestingService } from 'projects/sonar/tests/utils';
import { JoinPipe } from '../../core/join.pipe';
import { DepositService } from '../deposit.service';
import { ConfirmationComponent } from './confirmation.component';

describe('ConfirmationComponent', () => {
  let component: ConfirmationComponent;
  let fixture: ComponentFixture<ConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        RouterModule.forRoot([]),
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: BaseTranslateLoader,
                useClass: CoreTranslateLoader,
            }
        }),
        ConfirmationComponent, JoinPipe
    ],
    providers: [
        { provide: CoreConfigService, useClass: AppConfigService }, MessageService, ConfirmationService,
        { provide: DepositService, useValue: depositTestingService },
        provideHttpClientTesting(),
        provideHttpClient(withInterceptorsFromDi())
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
