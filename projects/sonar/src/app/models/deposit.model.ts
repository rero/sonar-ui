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
