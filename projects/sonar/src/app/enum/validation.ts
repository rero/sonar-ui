// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

export enum validation_status {
  'IN_PROGRESS' = 'in_progress',
  'VALIDATED' = 'validated',
  'TO_VALIDATE' = 'to_validate',
  'REJECTED' = 'rejected',
  'ASK_FOR_CHANGES' = 'ask_for_changes'
}

export enum validation_action {
  'SAVE' = 'save',
  'PUBLISH' = 'publish',
  'APPROVE' = 'approve',
  'REJECT' = 'reject',
  'ASK_FOR_CHANGES' = 'ask_for_changes'
}

export const VALIDATION_STATUS_SEVERITY: Record<string, string> = {
  [validation_status.IN_PROGRESS]: 'primary',
  [validation_status.TO_VALIDATE]: 'info',
  [validation_status.ASK_FOR_CHANGES]: 'warn',
  [validation_status.VALIDATED]: 'success',
  [validation_status.REJECTED]: 'danger'
};
