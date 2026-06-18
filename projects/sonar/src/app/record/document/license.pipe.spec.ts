// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
