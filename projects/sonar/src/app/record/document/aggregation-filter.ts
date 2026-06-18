// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TranslateService } from '@ngx-translate/core';
import { Bucket } from '@rero/ng-core';
import { Observable, Subscriber } from 'rxjs';

type RawAggregations = Record<string, { buckets?: Bucket[] } & Record<string, unknown>>;

export class AggregationFilter {
  static translateService: TranslateService;

  // Current view
  static view: string;

  /**
   * Creates an observable emitting the aggregations.
   *
   * @param aggregations Object containing the aggregations.
   * @returns Observable resolving aggregations.
   */
  static filter(aggregations: RawAggregations): Observable<RawAggregations> {
    return new Observable((observer: Subscriber<RawAggregations>): void => {
      observer.next(AggregationFilter.aggregationFilter(aggregations));
      AggregationFilter.translateService.onLangChange.subscribe(() => {
        observer.next(AggregationFilter.aggregationFilter(aggregations));
      });
    });
  }

  /**
   * Filter aggregations.
   *
   * @param aggregations Object containing the aggregations.
   * @returns Filtered aggregations.
   */
  static aggregationFilter(aggregations: RawAggregations): RawAggregations {
    const aggs: RawAggregations = {};

    Object.keys(aggregations).forEach(aggregation => {
      // Translate values for document type
      if (aggregation === 'document_type') {
        aggregations[aggregation].buckets?.forEach((bucket: Bucket) => {
          bucket.name = this.translateService.instant('document_type_' + bucket.key);
        });
      }

      if (aggregation === 'status') {
        aggregations[aggregation].buckets?.forEach((bucket: Bucket) => {
          bucket.name = this.translateService.instant('deposit_status_' + bucket.key);
        });
      }

      if (aggregation.indexOf('__') > -1) {
        const splitted = aggregation.split('__');
        if (AggregationFilter.translateService.getCurrentLang() === splitted[1]) {
          aggs[aggregation] = aggregations[aggregation];
        }
      } else {
        aggs[aggregation] = aggregations[aggregation];
      }
    });
    return aggs;
  }
}
