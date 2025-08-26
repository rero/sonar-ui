/*
 * SONAR User Interface
 * Copyright (C) 2025 RERO
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
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RecordService } from '@rero/ng-core';
import { cloneDeep } from 'lodash-es';
import { of } from 'rxjs';
import { BucketNameService } from './bucket-name.service';

describe('BucketNameService', () => {
  let service: BucketNameService;

  const record = {
    metadata: {
      label: 'Collection',
      name: [
        { language: 'fre', value: 'Collection french' },
        { language: 'eng', value: 'Collection english' }
      ]
    }
  }

  const recordServiceSpy = jasmine.createSpyObj('RecordService', ['getRecord']);
  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['stream']);
  translateServiceSpy.currentLang = 'fr';
  translateServiceSpy.stream.and.returnValue(of('default value'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: RecordService, useValue: recordServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    });
    service = TestBed.inject(BucketNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the default value', () => {
    service.transform('default', 'default value').subscribe(
      (value: string) => expect(value).toEqual('default value')
    );
  });

  it('should return the label value, if translations are not available.', () => {
    const recordNotTranslation = cloneDeep(record);
    delete recordNotTranslation.metadata.name;
    recordServiceSpy.getRecord.and.returnValue(of(recordNotTranslation));
    service.transform('collection_view', 'Collection').subscribe(
      (value: string) => expect(value).toEqual('Collection')
    );
  });

  it('should return the translation value according to the language', () => {
    translateServiceSpy.currentLang = 'fr';
    recordServiceSpy.getRecord.and.returnValue(of(record));
    service.transform('collection_view', 'Collection').subscribe(
      (value: string) => expect(value).toEqual('Collection french')
    );
    translateServiceSpy.currentLang = 'en';
    recordServiceSpy.getRecord.and.returnValue(of(record));
    service.transform('collection_view', 'Collection').subscribe(
      (value: string) => expect(value).toEqual('Collection english')
    );
  });
});
