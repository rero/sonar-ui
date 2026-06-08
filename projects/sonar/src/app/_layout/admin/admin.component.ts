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
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TranslateLanguageService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem } from 'primeng/api';
import { AppConfigService } from '../../app-config.service';
import { AppStore, AppStoreType } from '../../store/app.store';
import { User } from '../../models';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Menubar } from 'primeng/menubar';
import { Message } from 'primeng/message';

@Component({
    selector: 'sonar-layout-admin',
    templateUrl: './admin.component.html',
    imports: [
        RouterLink,
        TranslateDirective,
        Bind,
        Menubar,
        RouterOutlet,
        Message,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {

  private readonly spinner = inject(NgxSpinnerService);
  private readonly store = inject(AppStore) as AppStoreType;
  private readonly configService = inject(AppConfigService);
  private readonly httpClient = inject(HttpClient);
  private readonly translateService = inject(TranslateService);
  private readonly translateLanguageService = inject(TranslateLanguageService);

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  user = signal<User | null>(null);
  ready = signal(false);
  hideHeader = signal(false);
  items = signal<MenuItem[]>([]);
  userItems = signal<MenuItem[]>([]);

  constructor() {
    this.spinner.show();

    toObservable(this.store.user).pipe(takeUntilDestroyed()).subscribe({
      next: (user) => {
        if (user !== null) {
          this.user.set(user);
          this.spinner.hide();
          this.ready.set(true);
        }
      },
      complete: () => {
        this.spinner.hide();
        this.ready.set(true);
      },
    });

    this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this.setMenus());

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      this.hideHeader.set(route.snapshot.data['hideHeader'] === true);
    });

    effect(() => {
      if (this.user()) {
        this.setMenus();
      }
    });
  }

  private setMenus(): void {
    const user = this.user();
    if (!user) {
      return;
    }
    const t = (key: string) => this.translateService.instant(key);
    const isDedicated = this.store.isDedicatedOrganisation();

    this.items.set([
      {
        label: t('SONAR Administration'),
        visible: user.is_admin,
        items: [
          { label: t('Collections'), routerLink: ['/records/collections'], visible: isDedicated },
          { label: t('Organisations'), routerLink: ['/records/organisations'] },
          { label: t('Subdivisions'), routerLink: ['/records/subdivisions'], visible: isDedicated },
          { label: t('Users'), routerLink: ['/records/users'] },
        ],
      },
      { label: t('Documents'), routerLink: ['/records', 'documents'], visible: user.is_moderator },
      { label: t('Research projects'), routerLink: ['/records', 'projects'], visible: user.is_submitter },
      {
        label: t('Deposits'),
        visible: user.is_submitter,
        items: [
          { label: t('Deposit a publication'), routerLink: ['/deposit', 'create'] },
          { label: t('Deposits'), routerLink: ['/records', 'deposits'] },
        ],
      },
      { separator: true },
    ]);

    this.userItems.set([
      {
        label: `${user.last_name}, ${user.first_name}`,
        items: [
          { label: t('Public interface'), url: this.store.getPublicInterfaceLink(), target: 'public' },
          { label: t('Profile'), url: '/users/profile', target: '_self' },
          { label: t('Super administration'), url: '/admin', visible: user.is_superuser, target: 'admin' },
          { label: t('Logout'), url: '/logout', target: '_self' },
        ],
      },
      {
        label: this.translateService.getCurrentLang().toUpperCase(),
        items: this.configService.languagesMap.map((lang) => ({
          label: this.translateLanguageService.translate(lang.bibCode),
          command: () => this.changeLanguage(lang.code),
        })),
      },
    ]);
  }

  private changeLanguage(languageCode: string): void {
    this.translateService.use(languageCode);
    this.httpClient.get(`/lang/${languageCode}`, { responseType: 'text' }).subscribe();
  }
}
