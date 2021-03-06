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
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoreConfigService, TranslateLoader } from '@rero/ng-core';
import { depositTestingService, userTestingService } from 'projects/sonar/tests/utils';
import { DepositService } from '../../deposit/deposit.service';
import { UserService } from '../../user.service';
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
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: BaseTranslateLoader,
            useClass: TranslateLoader,
            deps: [CoreConfigService, HttpClient]
          },
          isolate: false
        })
      ],
      providers: [
        TranslateService,
        { provide: UserService, useValue: userTestingService },
        { provide: DepositService, useValue: depositTestingService }
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
