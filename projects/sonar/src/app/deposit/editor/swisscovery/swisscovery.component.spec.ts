// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { CoreConfigService } from '@rero/ng-core';

import { AppConfigService } from '../../../app-config.service';
import { SwisscoveryComponent } from './swisscovery.component';

describe('SwisscoveryComponent', () => {
  let component: SwisscoveryComponent;
  let fixture: ComponentFixture<SwisscoveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, SwisscoveryComponent],
      providers: [
        provideTranslateService(),
        { provide: CoreConfigService, useClass: AppConfigService },
        MessageService,
        provideHttpClientTesting(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SwisscoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
