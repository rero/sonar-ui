// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CoreConfigService } from '@rero/ng-core';
import type { IQueryOptions } from '@rero/ng-core';
import { AppConfigService } from './app-config.service';
import { UIAutocompleteService } from './ui-autocomplete.service';

describe('UIAutocompleteService', () => {
  let service: UIAutocompleteService;
  let httpTesting: HttpTestingController;

  const queryOptions: IQueryOptions = {
    type: 'documents',
    field: 'contribution.agent.preferred_name',
    suggest: '/api/suggestions/completion',
    allowAdd: true,
  };

  // Values of the items returned for a query, the server answering with the given suggestions.
  const suggestedValues = (query: string, suggestions: string[], options: IQueryOptions = queryOptions): string[] => {
    let values: string[] = [];
    service.getSuggestions(query, options, '').subscribe((items) => (values = items.map((item) => item.value)));
    httpTesting.expectOne((req) => req.url.startsWith('/api/suggestions/completion')).flush(suggestions);
    return values;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CoreConfigService, useClass: AppConfigService },
      ]
    });
    service = TestBed.inject(UIAutocompleteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow adding a value that only resembles a suggestion', () => {
    expect(suggestedValues('Doe john', ['Doé, John'])).toEqual(['Doé, John', 'Doe john']);
    expect(suggestedValues('Martin, Jean', ['Martin, Jean-Pierre'])).toEqual(['Martin, Jean-Pierre', 'Martin, Jean']);
  });

  it('should not allow adding a value equal to a suggestion', () => {
    expect(suggestedValues('Doé, John', ['Doé, John'])).toEqual(['Doé, John']);
  });

  it('should allow adding a value without any suggestion', () => {
    expect(suggestedValues('Doe john', [])).toEqual(['Doe john']);
  });

  it('should not allow adding a value when the field does not allow it', () => {
    expect(suggestedValues('Doe john', ['Doé, John'], { ...queryOptions, allowAdd: false })).toEqual(['Doé, John']);
  });
});
