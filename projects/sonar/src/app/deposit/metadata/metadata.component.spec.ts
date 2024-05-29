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
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EditorComponent, RecordModule } from '@rero/ng-core';
import { StepsModule } from 'primeng/steps';
import { of } from 'rxjs';
import { HighlightJsonPipe } from '../../core/highlight-json.pipe';
import { StepComponent } from '../../core/step/step.component';
import { DepositService } from '../deposit.service';
import { MetadataComponent } from './metadata.component';

const depositServiceSpy = jasmine.createSpyObj('DepositService', ['get', 'getFiles', 'canAccessDeposit']);
depositServiceSpy.get.and.returnValue(of({ metadata: {}}));
depositServiceSpy.getFiles.and.returnValue(of([]));
depositServiceSpy.canAccessDeposit.and.returnValue(true);

describe('MetadataComponent', () => {
  let component: MetadataComponent;
  let fixture: ComponentFixture<MetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        MetadataComponent,
        StepComponent,
        EditorComponent,
        HighlightJsonPipe
      ],
      imports: [
        FormsModule,
        RecordModule,
        TranslateModule.forRoot({}),
        RouterModule.forRoot([]),
        StepsModule
      ],
      providers: [
        { provide: DepositService, useValue: depositServiceSpy },
        provideHttpClientTesting(),
        provideHttpClient(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
