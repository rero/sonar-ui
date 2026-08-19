// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { DatePipe } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FieldType, FormlyModule } from '@ngx-formly/core';
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

/** Minimal field type, the real ones come from ng-core and are not needed here. */
@Component({
  selector: 'sonar-stub-field',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StubFieldComponent extends FieldType {}

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
        FormlyModule.forRoot({
          types: [
            { name: 'object', extends: 'formly-group' },
            { name: 'string', component: StubFieldComponent },
          ],
        }),
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

  describe('when navigating between steps', () => {
    const schema = {
      type: 'object',
      properties: {
        metadata: {
          type: 'object',
          properties: { title: { type: 'string' } },
          required: ['title'],
        },
        contributors: {
          type: 'object',
          properties: { name: { type: 'string' } },
          required: ['name'],
        },
      },
    };

    beforeEach(() => {
      depositStoreMock.schema.set(schema);
      depositStoreMock.deposit.set({
        pid: '1',
        step: 'contributors',
        status: 'in_progress',
        metadata: {},
        contributors: {},
      });
      fixture.componentRef.setInput('steps', ['metadata', 'contributors']);
      fixture.componentRef.setInput('currentStep', 'contributors');
      fixture.detectChanges();
    });

    it('should drop the controls of the previous step', () => {
      expect(Object.keys(component.form().controls)).toEqual(['contributors']);

      fixture.componentRef.setInput('currentStep', 'metadata');
      fixture.detectChanges();

      expect(Object.keys(component.form().controls)).toEqual(['metadata']);
    });

    it('should save when the current step is valid, whatever the previous step was', () => {
      // the previous step is left invalid (its required field is empty)
      expect(component.form().valid).toBe(false);

      fixture.componentRef.setInput('currentStep', 'metadata');
      fixture.detectChanges();
      component.form().get('metadata.title')!.setValue('A title');
      fixture.detectChanges();

      component.save();

      expect(depositStoreMock.update).toHaveBeenCalled();
    });
  });
});
