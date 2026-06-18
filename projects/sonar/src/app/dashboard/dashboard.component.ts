// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';

/**
 * Dashboard page
 */
@Component({
    selector: 'sonar-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [TranslateDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
