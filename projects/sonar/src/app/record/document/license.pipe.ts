/*
 * SONAR User Interface
 * Copyright (C) 2025 RERO
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

type License = { icon: string; link: string };

const LICENSES: Record<string, License> = {
  CC0: {
    icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg',
    link: 'https://creativecommons.org/publicdomain/zero/1.0/'
  },
  'CC BY': {
    icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by.svg',
    link: 'https://creativecommons.org/licenses/by/4.0/'
  },
  'CC BY-NC': {
    icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc.svg',
    link: 'https://creativecommons.org/licenses/by-nc/4.0/'
  },
  'CC BY-NC-ND': {
    icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.svg',
    link: 'https://creativecommons.org/licenses/by-nc-nd/4.0/'
  },
  'CC BY-NC-SA': {
    icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg',
    link: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
  },
  'CC BY-ND': {
    icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nd.svg',
    link: 'https://creativecommons.org/licenses/by-nd/4.0/'
  },
  'CC BY-SA': {
    icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg',
    link: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
};

@Pipe({ name: 'license' })
export class LicensePipe implements PipeTransform {
  transform(licenseKey: string): License | null {
    return LICENSES[licenseKey] ?? null;
  }
}
