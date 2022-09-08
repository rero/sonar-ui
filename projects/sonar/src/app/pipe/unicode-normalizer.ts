/*
 * SONAR User Interface
 * Copyright (C) 2022 RERO
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
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Get string in its unicode normalized form.
 */
@Pipe({
  name: 'unicode_normalizer'
})
export class UnicodeNormalizerPipe implements PipeTransform {
  /**
   * Transform string to a unicode normalized form.
   *
   * @param string String to transform.
   * @param unicode Unicode form.
   * @return Unicode normalized form of string.
   */
  transform(str: string, unicodeForm: string) {
    return str.normalize(unicodeForm);
  }
}
