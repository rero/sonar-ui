// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

export type DepositStatus = 'in_progress' | 'ask_for_changes' | 'to_validate' | 'validated' | 'rejected';

export type DepositFile = {
  key: string;
  version_id: string;
  order?: number;
  [key: string]: unknown;
}

export type JsonRef = { $ref: string };

export type Deposit = {
  pid: string;
  status: DepositStatus;
  step?: string;
  user: JsonRef;
  document?: JsonRef;
  _files?: DepositFile[];
  diffusion?: { license?: string; [key: string]: unknown };
  [key: string]: unknown;
}
