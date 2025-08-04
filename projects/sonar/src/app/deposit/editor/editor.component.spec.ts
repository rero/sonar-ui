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
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, FilesizePipe, RecordModule, TranslateLoader } from '@rero/ng-core';
import { DialogModule } from 'primeng/dialog';
import { depositTestingService, userTestingService } from 'projects/sonar/tests/utils';
import { of } from 'rxjs';
import { FileLinkPipe } from '../../core/file-link.pipe';
import { HighlightJsonPipe } from '../../core/highlight-json.pipe';
import { JoinPipe } from '../../core/join.pipe';
import { StepComponent } from '../../core/step/step.component';
import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';
import { ReviewComponent } from '../review/review.component';
import { EditorComponent } from './editor.component';
import { SwisscoveryComponent } from './swisscovery/swisscovery.component';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  const route = {
    params: of({ step: 'metadata' }),
    snapshot: {
      params: {
        id: '0'
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        EditorComponent,
        StepComponent,
        ReviewComponent,
        SwisscoveryComponent,
        JoinPipe,
        FileLinkPipe,
        FilesizePipe,
        HighlightJsonPipe
    ],
    imports: [BrowserAnimationsModule,
      ReactiveFormsModule,
      RecordModule,
      RouterModule.forRoot([]),
      TranslateModule.forRoot({
        loader: {
          provide: BaseTranslateLoader,
          useClass: TranslateLoader,
          deps: [CoreConfigService, HttpClient]
        }
      }),
      FormsModule,
      FormlyModule,
      DialogModule
    ],
    providers: [
      DatePipe,
      { provide: ActivatedRoute, useValue: route },
      { provide: UserService, useValue: userTestingService },
      { provide: DepositService, useValue: depositTestingService },
      provideHttpClient(withInterceptorsFromDi())
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.componentRef.setInput('deposit', {});
    fixture.componentRef.setInput('steps', []);
    fixture.componentRef.setInput('currentStep', 'metadata');
    fixture.componentRef.setInput('mainFile', {});
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
