/*
 * SONAR UI
 * Copyright (C) 2019 RERO
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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RecordModule, TranslateLoader } from '@rero/ng-core';
import { TranslateModule, TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';
import { FormlyModule } from '@ngx-formly/core';

import { EditorComponent } from './editor.component';
import { JoinPipe } from '../../core/join.pipe';
import { FileLinkPipe } from '../../core/file-link.pipe';
import { FileSizePipe } from '../../core/filesize.pipe';
import { StepComponent } from '../../core/step/step.component';
import { HighlightJsonPipe } from '../../core/highlight-json.pipe';
import { ReviewComponent } from '../review/review.component';

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

  beforeEach(async(() => {
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
            useClass: TranslateLoader
          }
        }),
        FormlyModule
      ],
      providers: [{ provide: ActivatedRoute, useValue: route }]
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
