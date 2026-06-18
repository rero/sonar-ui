// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreTranslateLoader } from '@rero/ng-core';
import { PublicationPipe } from './publication.pipe';

let pipe: PublicationPipe;

describe('PublicationPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PublicationPipe],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader },
        }),
      ],
    });

    pipe = TestBed.inject(PublicationPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty publication', () => {
    expect(pipe.transform({})).toBe('');
  });

  it('should return only document', () => {
    expect(pipe.transform({ document: { title: 'Journal' } })).toBe('Journal');
  });

  it('should return document and year', () => {
    expect(
      pipe.transform({ document: { title: 'Journal' }, numberingYear: '2000' })
    ).toBe('Journal, 2000');
  });

  it('should return document, year and issue', () => {
    expect(
      pipe.transform({
        document: { title: 'Journal' },
        numberingYear: '2000',
        numberingIssue: '12',
      })
    ).toBe('Journal, 2000, no. 12');
  });

  it('should return document, year, issue and volume', () => {
    expect(
      pipe.transform({
        document: { title: 'Journal' },
        numberingYear: '2000',
        numberingIssue: '12',
        numberingVolume: '1',
      })
    ).toBe('Journal, 2000, vol. 1, no. 12');
  });

  it('should return document, year, issue, volume and pages', () => {
    expect(
      pipe.transform({
        document: { title: 'Journal' },
        numberingYear: '2000',
        numberingIssue: '12',
        numberingVolume: '1',
        numberingPages: '20-25',
      })
    ).toBe('Journal, 2000, vol. 1, no. 12, p. 20-25');
  });
});
