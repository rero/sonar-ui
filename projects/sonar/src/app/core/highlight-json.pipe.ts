// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Highlight a JSON structure.
 */
@Pipe({ name: 'highlightJson' })
export class HighlightJsonPipe implements PipeTransform {

  private sanitizer: DomSanitizer = inject(DomSanitizer);

  /**
   * Highlight a JSON structure.
   *
   * @param value Json structure.
   * @return Highlighted string.
   */
  transform(value: string): SafeHtml {
    let json = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    json = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match: string) => {
        let cls = 'ui:text-muted-color';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-error';
          } else {
            cls = 'text-success';
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-primary';
        } else if (/null/.test(match)) {
          cls = 'text-warning';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

    return this.sanitizer.bypassSecurityTrustHtml(json);
  }
}
