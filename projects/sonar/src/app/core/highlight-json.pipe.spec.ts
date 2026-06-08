/*
 * SONAR UI
 * Copyright (C) 2021-2025 RERO
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
