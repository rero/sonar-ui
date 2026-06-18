// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

export type IContribution = {
  text?: string;
  agent: {
    type: string;
    preferred_name: string;
    identifiedBy?: {
      type: string;
      source?: string;
      value: string;
    },
    date_of_birth?: string;
    date_of_death?: string;
    place?: string;
    date?: string;
    number?: string;

  };
  role: string[];
  affiliation?: string;
  controlledAffiliation?: string[];
}
