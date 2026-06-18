// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Join the array with given separator and return the result string.
 */
@Pipe({ name: 'join' })
export class JoinPipe implements PipeTransform {
  /**
   * Join an array by the given separator.
   *
   * @param value Values to join.
   * @param args List of arguments.
   * @return Joined string.
   */
  transform(value: string[], ...args: string[]): string {
    if (!value) {
      return '';
    }

    if (!args[0]) {
      args[0] = ', ';
    }
    return value.join(args[0]);
  }
}
