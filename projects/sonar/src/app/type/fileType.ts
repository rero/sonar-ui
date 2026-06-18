// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { SafeUrl } from "@angular/platform-browser";

export type File = {
  // thumbnail URL
  thumbnail?: string;
  // download URL
  download: string;
  // thumbnail legend
  label: string;
  // preview URL
  preview?: string;
}

export type previewFile = {
  label: string;
  url: SafeUrl;
}
