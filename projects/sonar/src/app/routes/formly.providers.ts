// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideCoreFormly, RemoteAutocompleteService } from '@rero/ng-core/editor';

import { UIAutocompleteService } from '../ui-autocomplete.service';

// Only imported by the lazy routes, so Formly stays out of the initial bundle.
export const sonarFormlyProviders: (Provider | EnvironmentProviders)[] = [
  provideCoreFormly(),
  { provide: RemoteAutocompleteService, useClass: UIAutocompleteService },
];
