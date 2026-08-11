// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { toAggregationsConfig } from './documents-route';

const aggregations = [
  'document_type',
  'year',
  { key: 'customField1', name: 'Étendue' },
  { key: 'customField3', name: 'Projet' },
];

describe('documents aggregations', () => {
  describe('toAggregationsConfig', () => {
    it('should keep the order given by the backend', () => {
      expect(toAggregationsConfig(aggregations).order)
        .toEqual(['document_type', 'year', 'customField1', 'customField3']);
    });

    it('should index the named aggregations by key', () => {
      expect(toAggregationsConfig(aggregations).names)
        .toEqual({ customField1: 'Étendue', customField3: 'Projet' });
    });

    it('should return no name when no aggregation is named', () => {
      expect(toAggregationsConfig(['document_type', 'year']).names).toEqual({});
    });

    it('should return an empty configuration when there is no aggregation', () => {
      expect(toAggregationsConfig([])).toEqual({ order: [], names: {} });
    });
  });
});
