/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormlyModule } from '@ngx-formly/core';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, RecordModule, TranslateLoader } from '@rero/ng-core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { depositTestingService, userTestingService } from 'projects/sonar/tests/utils';
import { of } from 'rxjs';
import { FileLinkPipe } from '../../core/file-link.pipe';
import { FileSizePipe } from '../../core/filesize.pipe';
import { HighlightJsonPipe } from '../../core/highlight-json.pipe';
import { JoinPipe } from '../../core/join.pipe';
import { StepComponent } from '../../core/step/step.component';
import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';
import { ReviewComponent } from '../review/review.component';
import { EditorComponent } from './editor.component';

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
        JoinPipe,
        FileLinkPipe,
        FileSizePipe,
        HighlightJsonPipe
      ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RecordModule,
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: BaseTranslateLoader,
            useClass: TranslateLoader,
            deps: [CoreConfigService, HttpClient]
          }
        }),
        FormlyModule,
        ModalModule.forRoot()
      ],
      providers: [
        DatePipe,
        { provide: ActivatedRoute, useValue: route },
        { provide: UserService, useValue: userTestingService },
        { provide: DepositService, useValue: depositTestingService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
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
