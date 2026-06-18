// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be a function', () => {
    expect(roleGuard).toBeTruthy();
    expect(typeof roleGuard).toBe('function');
  });
});
