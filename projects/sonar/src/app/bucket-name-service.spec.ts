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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recordServiceSpy = { getRecord: vi.fn() } as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translateServiceSpy = { stream: vi.fn(), currentLang: 'fr', getCurrentLang: vi.fn() } as any;
  translateServiceSpy.stream.mockReturnValue(of('default value'));
  translateServiceSpy.getCurrentLang.mockImplementation(() => translateServiceSpy.currentLang);

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
    service.transform({ key: 'default', doc_count: 0, aggregationKey: 'other', name: 'default value' }).subscribe(
      (value: string) => expect(value).toEqual('default value')
    );
  });

  it('should return the label value, if translations are not available.', () => {
    const recordNotTranslation = cloneDeep(record);
    delete recordNotTranslation.metadata.name;
    recordServiceSpy.getRecord.mockReturnValue(of(recordNotTranslation));
    service.transform({ key: 'collection_key', doc_count: 0, aggregationKey: 'collection_view' }).subscribe(
      (value: string) => expect(value).toEqual('Collection')
    );
  });

  it('should return the translation value according to the language', () => {
    translateServiceSpy.currentLang = 'fr';
    recordServiceSpy.getRecord.mockReturnValue(of(record));
    service.transform({ key: 'collection_key', doc_count: 0, aggregationKey: 'collection_view' }).subscribe(
      (value: string) => expect(value).toEqual('Collection french')
    );
    translateServiceSpy.currentLang = 'en';
    recordServiceSpy.getRecord.mockReturnValue(of(record));
    service.transform({ key: 'collection_key', doc_count: 0, aggregationKey: 'collection_view' }).subscribe(
      (value: string) => expect(value).toEqual('Collection english')
    );
  });
});
