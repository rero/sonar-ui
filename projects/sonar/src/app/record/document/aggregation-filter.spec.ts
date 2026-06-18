// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import { depositTestingService } from 'projects/sonar/tests/utils';
import { DepositService } from '../../deposit/deposit.service';
import { AggregationFilter } from './aggregation-filter';

const aggregations = {
  author__en: {
    buckets: [
      { doc_count: 3, key: 'Bach, Johann Sebastian' },
      { doc_count: 2, key: 'Auzias, Dominique' }
    ],
    doc_count_error_upper_bound: 0,
    sum_other_doc_count: 517
  },
  author__fr: {
    buckets: [
      { doc_count: 3, key: 'Bach, Johann Sebastien' },
      { doc_count: 2, key: 'Auzias, Dominique' }
    ],
    doc_count_error_upper_bound: 0,
    sum_other_doc_count: 517
  },
  document_type: {
    buckets: [{ doc_count: 206, key: 'book' }, { doc_count: 100, key: 'ebook' }],
    doc_count_error_upper_bound: 0,
    sum_other_doc_count: 0
  },
  organisation: {
    buckets: [{ doc_count: 100, key: 'org1' }, { doc_count: 10, key: 'org2' }],
    doc_count_error_upper_bound: 0,
    sum_other_doc_count: 0
  }
};

describe('AggregationFilter', () => {
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: BaseTranslateLoader,
            useClass: CoreTranslateLoader,
          },
          isolate: false
        })
      ],
      providers: [
        { provide: CoreConfigService, useClass: AppConfigService },
        TranslateService,
        { provide: DepositService, useValue: depositTestingService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    translate = TestBed.inject(TranslateService);
    translate.use('en');
  });

  it('should filter aggregations', () => {
    AggregationFilter.translateService = translate;
    AggregationFilter.filter(aggregations).subscribe(data => {
      const keys = Object.keys(data);
      expect(keys).toEqual(['author__en', 'document_type', 'organisation']);
      expect(keys.length).toBe(3);
    });
  });
});
