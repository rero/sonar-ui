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
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService, TranslateDirective } from '@ngx-translate/core';
import { AppConfigService } from './app-config.service';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { Bind } from 'primeng/bind';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
    selector: 'sonar-root',
    templateUrl: './app.component.html',
    imports: [TranslateDirective, RouterOutlet, Bind, ConfirmDialog, NgxSpinnerComponent, Toast],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  private readonly translateService = inject(TranslateService);
  private readonly appConfigService = inject(AppConfigService);

  constructor() {
    // Ex: <html lang="en" data-view="global">
    this.appConfigService.view = document.querySelector('html').getAttribute('data-view');
    const language = document.documentElement.lang || this.appConfigService.defaultLanguage;
    this.translateService.use(language);
  }
}
