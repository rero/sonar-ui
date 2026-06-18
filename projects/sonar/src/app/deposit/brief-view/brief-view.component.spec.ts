// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreTranslateLoader } from '@rero/ng-core';
import { depositTestingService } from 'projects/sonar/tests/utils';
import { DepositService } from '../deposit.service';
import { BriefViewComponent } from './brief-view.component';

describe('BriefViewComponent', () => {
  let component: BriefViewComponent;
  let fixture: ComponentFixture<BriefViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
            loader: {
                provide: BaseTranslateLoader,
                useClass: CoreTranslateLoader,
            }
        }),
        BriefViewComponent
    ],
    providers: [
        { provide: DepositService, useValue: depositTestingService },
        provideHttpClientTesting(),
        provideHttpClient(withInterceptorsFromDi())
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BriefViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', { metadata: { user: { first_name: '', last_name: '' } } });
    fixture.componentRef.setInput('type', 'test');
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
