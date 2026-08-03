// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ActivatedRouteSnapshot } from '@angular/router';
import { publicSearchViewResolver } from './app.routes';

describe('publicSearchViewResolver', () => {
  const buildRoute = (params: Record<string, string>, data: Record<string, unknown>): ActivatedRouteSnapshot =>
    ({ params, data }) as ActivatedRouteSnapshot;

  it('should set detailUrl at the root of route.data, not on the record type', () => {
    const types = [{ key: 'documents' }];
    const route = buildRoute({ view: 'global' }, { types });

    publicSearchViewResolver(route, undefined as never);

    expect(route.data['detailUrl']).toBe('/global/:type/:pid');
    expect(types[0]['detailUrl']).toBeUndefined();
  });

  it('should set preFilters on the record type', () => {
    const types = [{ key: 'documents' }];
    const route = buildRoute({ view: 'global' }, { types });

    publicSearchViewResolver(route, undefined as never);

    expect(types[0]['preFilters']).toEqual({ view: 'global' });
  });

  it('should do nothing when there is no view param', () => {
    const types = [{ key: 'documents' }];
    const route = buildRoute({}, { types });

    publicSearchViewResolver(route, undefined as never);

    expect(route.data['detailUrl']).toBeUndefined();
    expect(types[0]['preFilters']).toBeUndefined();
  });

  it('should do nothing when there are no types', () => {
    const route = buildRoute({ view: 'global' }, { types: [] });

    publicSearchViewResolver(route, undefined as never);

    expect(route.data['detailUrl']).toBeUndefined();
  });
});
