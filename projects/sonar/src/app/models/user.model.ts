// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

export type UserOrganisation = {
  code: string;
  isDedicated?: boolean;
  pid?: string;
  [key: string]: unknown;
}

export type User = {
  pid: string;
  role: string;
  is_user?: boolean;
  is_submitter?: boolean;
  is_moderator?: boolean;
  is_admin?: boolean;
  is_superuser?: boolean;
  [key: string]: unknown;
}
