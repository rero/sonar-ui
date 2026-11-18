// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { ConfirmDialog } from '@openng/optimus-ui/confirmdialog';
import { Toast } from '@openng/optimus-ui/toast';
import { NgxSpinnerComponent } from 'ngx-spinner';

import { AppConfigService } from './app-config.service';

@Component({
  selector: 'sonar-root',
  templateUrl: './app.component.html',
  imports: [TranslatePipe, RouterOutlet, Bind, ConfirmDialog, NgxSpinnerComponent, Toast],
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
