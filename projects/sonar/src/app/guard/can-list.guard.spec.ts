// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { canListGuard } from './can-list.guard';

describe('canListGuard', () => {
  it('should be a function', () => {
    expect(canListGuard).toBeTruthy();
    expect(typeof canListGuard).toBe('function');
  });
});
