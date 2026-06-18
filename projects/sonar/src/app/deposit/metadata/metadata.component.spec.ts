// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { CoreConfigService } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EMPTY, of } from 'rxjs';
import { HighlightJsonPipe } from '../../core/highlight-json.pipe';
import { StepComponent } from '../../core/step/step.component';
import { AppStore } from '../../store/app.store';
import { DepositService } from '../deposit.service';
import { DepositStore } from '../deposit.store';
import { MetadataComponent } from './metadata.component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const depositStoreMock: any = {
  deposit: signal(null),
  schema: signal(null),
  isLoading: signal(false),
  error: signal(null),
  canAccess: () => false,
  mainFile: () => null,
  additionalFiles: () => [],
  maxStep: () => 'metadata',
  load: vi.fn().mockReturnValue(EMPTY),
  loadSchema: vi.fn().mockReturnValue(of({})),
  update: vi.fn().mockReturnValue(EMPTY),
  publish: vi.fn().mockReturnValue(EMPTY),
  reviewDeposit: vi.fn().mockReturnValue(EMPTY),
  extractPDFMetadata: vi.fn().mockReturnValue(EMPTY),
  mergeDeposit: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const appStoreMock: any = {
  user: signal(null),
  hasRole: vi.fn().mockReturnValue(false),
  checkUserReference: vi.fn().mockReturnValue(false),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const depositServiceSpy: any = {
  get: vi.fn().mockReturnValue(of({ metadata: {} })),
  getJsonSchema: vi.fn().mockReturnValue(of({ type: 'object', properties: {} })),
};

describe('MetadataComponent', () => {
  let component: MetadataComponent;
  let fixture: ComponentFixture<MetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        FormsModule,
        FormlyModule.forRoot({}),
        TranslateModule.forRoot({}),
        RouterModule.forRoot([]),
        MetadataComponent,
        StepComponent,
        HighlightJsonPipe,
      ],
      providers: [
        { provide: CoreConfigService, useClass: AppConfigService },
        MessageService,
        ConfirmationService,
        { provide: DepositService, useValue: depositServiceSpy },
        { provide: DepositStore, useValue: depositStoreMock },
        { provide: AppStore, useValue: appStoreMock },
        { provide: ActivatedRoute, useValue: { params: of({ id: '42', step: 'metadata' }) } },
        provideHttpClientTesting(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
