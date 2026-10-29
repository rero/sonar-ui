// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { StepsModule } from '@openng/optimus-ui/steps';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { depositTestingService } from 'projects/sonar/tests/utils';

import { AppConfigService } from '../../app-config.service';
import { DepositService } from '../../deposit/deposit.service';
import { StepComponent } from './step.component';

describe('StepComponent', () => {
  let component: StepComponent;
  let fixture: ComponentFixture<StepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), StepsModule, StepComponent],
      providers: [
        provideTranslateService({
          loader: {
            provide: BaseTranslateLoader,
            useClass: CoreTranslateLoader,
          },
        }),
        { provide: CoreConfigService, useClass: AppConfigService },
        { provide: DepositService, useValue: depositTestingService },
        provideHttpClientTesting(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('steps', ['create', 'metadata', 'contributors', 'diffusion']);
    fixture.componentRef.setInput('maxStep', 'metadata');
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
