/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { DatePipe } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { depositTestingService } from 'projects/sonar/tests/utils';
import { EMPTY, of } from 'rxjs';
import { AppStore } from '../../store/app.store';
import { DepositService } from '../deposit.service';
import { DepositStore } from '../deposit.store';
import { EditorComponent } from './editor.component';

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

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader },
        }),
        FormsModule,
        FormlyModule.forRoot({}),
        DialogModule,
        EditorComponent,
      ],
      providers: [
        { provide: CoreConfigService, useClass: AppConfigService },
        MessageService,
        ConfirmationService,
        DatePipe,
        { provide: DepositService, useValue: depositTestingService },
        { provide: DepositStore, useValue: depositStoreMock },
        { provide: AppStore, useValue: appStoreMock },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.componentRef.setInput('steps', []);
    fixture.componentRef.setInput('currentStep', 'metadata');
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
