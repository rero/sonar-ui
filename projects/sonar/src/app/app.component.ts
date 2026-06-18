// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
