// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Routes } from '@angular/router';
import { EditorComponent } from '@rero/ng-core/editor';

import { sonarFormlyProviders } from './formly.providers';

export const profileRoutes: Routes = [{ path: '', providers: sonarFormlyProviders, component: EditorComponent }];
