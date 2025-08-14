/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
