// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FaIconClassPipe } from './fa-icon-class.pipe';

describe('FaIconClassPipe', () => {
  let pipe: FaIconClassPipe;

  beforeEach(() => {
    pipe = new FaIconClassPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return icons for the file', () => {
    expect(pipe.transform(null, 'file')).toEqual('fa-regular fa-file');
    expect(pipe.transform('font/ttf', 'file')).toEqual('fa-regular fa-file');
    expect(pipe.transform('image/png', 'file')).toEqual('fa-regular fa-file-image');
  });

  it('should return icons for the type of contribution', () => {
    expect(pipe.transform(null, 'contribution')).toEqual('fa-solid fa-circle');
    expect(pipe.transform('bf:Person', 'contribution')).toEqual('fa-solid fa-user');
    expect(pipe.transform('bf:Organization', 'contribution')).toEqual('fa-solid fa-building');
    expect(pipe.transform('bf:Meeting', 'contribution')).toEqual('fa-solid fa-users');
  });
});
