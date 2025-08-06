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
import { LicensePipe } from './license.pipe';

describe('LicensePipe', () => {
  let pipe: LicensePipe;

  beforeEach(() => {
    pipe = new LicensePipe();
  });

  it('should return license info', () => {
    const licenseInfo = {
      icon: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc.svg',
      link: 'https://creativecommons.org/licenses/by-nc/4.0/'
    };
    expect(pipe.transform('CC BY-NC')).toEqual(licenseInfo);
  });

  it('should return null if the license is not known.', () => {
    expect(pipe.transform('License undefined')).toBeNull();
  });
});
