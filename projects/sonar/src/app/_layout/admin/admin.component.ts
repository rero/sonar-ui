/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateLanguageService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../../app-config.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'sonar-layout-admin',
  templateUrl: './admin.component.html',
  standalone: false,
})
export class AdminComponent implements OnInit, OnDestroy {

  private spinner: NgxSpinnerService = inject(NgxSpinnerService);
  private userService: UserService = inject(UserService);
  private configService: AppConfigService = inject(AppConfigService);
  private httpClient: HttpClient = inject(HttpClient);
  private translateService: TranslateService = inject(TranslateService);
  private translateLanguageService: TranslateLanguageService = inject(TranslateLanguageService);

  // Logged user
  user: any;

  // Application is ready?
  ready = signal<boolean>(false);

  items = signal<MenuItem[]>(undefined);
  userItems = signal<MenuItem[]>(undefined);

  // User subscription
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    // collections', 'organisations', 'subdivisions', 'users'
    this.spinner.show();
    this.translateService.onLangChange.subscribe({
      next: ()=> this.setMenus()
    });
    this.subscription.add(this.userService.user$.subscribe({
      next: (user) => {
        if (user !== null) {
          this.user = user;
          this.spinner.hide();
          this.ready.set(true);
          this.setMenus();
        }
      },
      complete: () => {
        this.spinner.hide();
        this.ready.set(true);
      },
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /** */
  setMenus() {
    this.items.set([
      {
        label:  this.translateService.instant('SONAR Administration'),
        visible: this.user.is_admin,
        items: [
          {
            label: this.translateService.instant('Collections'),
            routerLink: ['/records/collections'],
            visible: this.userService.isDedicatedOrganisation()
          },
          {
            label: this.translateService.instant('Organisations'),
            routerLink: ['/records/organisations'],
          },
          {
            label:  this.translateService.instant('Subdivisions'),
            routerLink: ['/records/subdivisions'],
            visible: this.userService.isDedicatedOrganisation()
          },
          {
            label:  this.translateService.instant('Users'),
            routerLink: ['/records/users'],
          },
        ],
      },
      {
        label:  this.translateService.instant('Documents'),
        routerLink: ['/records', 'documents'],
        visible: this.user.is_moderator
      },
      {
        label:  this.translateService.instant('Research projects'),
        routerLink: ['/records', 'projects'],
        visible: this.user.is_submitter
      },
      {
        label:  this.translateService.instant('Deposits'),
        visible: this.user.is_submitter,
        items: [
          {
            label:  this.translateService.instant('Deposit a publication'),
            routerLink: ['/deposit', 'create'],
          },
          {
            label:  this.translateService.instant('Deposits'),
            routerLink: ['/records', 'deposits'],
          },
        ],
      },
      {
        separator: true,
      },
    ]);
    if (this.user) {
      this.userItems.set([
        {
          label: this.user
            ? `${this.user.last_name}, ${this.user.first_name}`
            : 'user',
          items: [
            {
              label:  this.translateService.instant('Public interface'),
              url: this.userService.getPublicInterfaceLink(),
            },
            {
              label:  this.translateService.instant('Profile'),
              url: '/users/profile',
            },
            {
              label:  this.translateService.instant('Super administration'),
              url: '/admin',
              visible: this.user.is_superuser
            },
            {
              label:  this.translateService.instant('Logout'),
              url: '/logout',
            },
          ],
        },
        {
          label: this.translateService.currentLang.toUpperCase(),
          items: this.configService.languagesMap.map((lang) => {
            return {
              label: this.translateLanguageService.translate(lang.bibCode),
              command: () => this.changeLanguage(lang.code),
            };
          }),
        },
      ]);
    }
  }

  private changeLanguage(languageCode: string) {
    this.translateService.use(languageCode);
    this.changeFlaskLanguage(languageCode);
  }

  private changeFlaskLanguage(languageCode: string): void {
    this.httpClient
      .get(`/lang/${languageCode}`, { responseType: 'text' })
      .subscribe();
  }
}
