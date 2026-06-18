// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
export type DocumentFile = {
  key: string;
  label: string;
  thumbnail: string;
  links: {
    external: string;
    preview: string;
    download: string;
  };
  restriction: {
    restricted: boolean;
    date: string;
  };
}
