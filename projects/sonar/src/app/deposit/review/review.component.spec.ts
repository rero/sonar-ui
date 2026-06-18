// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EMPTY } from 'rxjs';
import { AppStore } from '../../store/app.store';
import { DepositStore } from '../deposit.store';
import { ReviewComponent } from './review.component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const depositStoreMock: any = {
  deposit: signal(null),
  reviewDeposit: vi.fn().mockReturnValue(EMPTY),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const appStoreMock: any = {
  user: signal(null),
};

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader },
        }),
        RouterModule.forRoot([]),
        ReviewComponent,
      ],
      providers: [
        { provide: CoreConfigService, useClass: AppConfigService },
        ConfirmationService,
        MessageService,
        { provide: DepositStore, useValue: depositStoreMock },
        { provide: AppStore, useValue: appStoreMock },
        provideHttpClientTesting(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('deposit', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
