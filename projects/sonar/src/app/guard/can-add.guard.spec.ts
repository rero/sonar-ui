// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { canAddGuard } from './can-add.guard';

describe('canAddGuard', () => {
  it('should be a function', () => {
    expect(canAddGuard).toBeTruthy();
    expect(typeof canAddGuard).toBe('function');
  });
});
