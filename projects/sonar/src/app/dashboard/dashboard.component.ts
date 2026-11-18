// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Dashboard page
 */
@Component({
  selector: 'sonar-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [TranslatePipe],
})
export class DashboardComponent {}
