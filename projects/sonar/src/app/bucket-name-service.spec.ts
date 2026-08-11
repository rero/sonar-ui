// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IFilter, RecordService } from '@rero/ng-core';
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

  it('should translate the values with the prefix of their aggregation', () => {
    translateServiceSpy.stream.mockClear();
    service.transform({ key: 'eng', doc_count: 0, aggregationKey: 'language' }).subscribe();
    expect(translateServiceSpy.stream).toHaveBeenCalledWith('lang_eng');
    service.transform({ key: 'coar:c_12cc', doc_count: 0, aggregationKey: 'document_type' }).subscribe();
    expect(translateServiceSpy.stream).toHaveBeenCalledWith('document_type_coar:c_12cc');
    service.transform({ key: 'validated', doc_count: 0, aggregationKey: 'status' }).subscribe();
    expect(translateServiceSpy.stream).toHaveBeenCalledWith('deposit_status_validated');
  });

  it('should name a selected filter, which carries no document count', () => {
    translateServiceSpy.stream.mockClear();
    const filter: IFilter = { key: 'eng', aggregationKey: 'language' };
    service.transform(filter).subscribe();
    expect(translateServiceSpy.stream).toHaveBeenCalledWith('lang_eng');
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
