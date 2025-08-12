/*
 * SONAR User Interface
 * Copyright (C) 2019-2025 RERO
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
    expect(pipe.transform(null, 'file')).toEqual('fa-file-o');
    expect(pipe.transform('font/ttf', 'file')).toEqual('fa-file-o');
    expect(pipe.transform('image/png', 'file')).toEqual('fa-file-image-o');
  });

  it('should return icons for the type of contribution', () => {
    expect(pipe.transform(null, 'contribution')).toEqual('fa-circle');
    expect(pipe.transform('bf:Person', 'contribution')).toEqual('fa-user');
    expect(pipe.transform('bf:Organization', 'contribution')).toEqual('fa-building');
    expect(pipe.transform('bf:Person', 'contribution')).toEqual('fa-user');
  });
});
