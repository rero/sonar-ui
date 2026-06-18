// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { HighlightJsonPipe } from './highlight-json.pipe';

describe('HighlightJsonPipe', () => {
  let pipe: HighlightJsonPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [HighlightJsonPipe],
    providers: [
        HighlightJsonPipe,
        {
            provide: DomSanitizer,
            useValue: {
                bypassSecurityTrustHtml: (val: string) => val
            }
        }
    ]
});
    pipe = TestBed.inject(HighlightJsonPipe);
  });

  it('highlight json by injecting customs css classes', () => {
    const highlightedText = pipe.transform('{ title: "Title of document" }');
    expect(highlightedText).toBe('{ title: <span class="text-success">"Title of document"</span> }');
  })
});
