// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
    const isDedicated = this.store.isDedicatedOrganisation();

    this.items.set([
      {
        label: this.translateService.instant('SONAR Administration'),
        icon: 'fa-solid fa-gear',
        visible: user.is_admin,
        items: [
          { label: this.translateService.instant('Collections'), icon: 'fa-solid fa-layer-group', routerLink: ['/records/collections'], visible: isDedicated },
          { label: this.translateService.instant('Organisations'), icon: 'fa-solid fa-building-columns', routerLink: ['/records/organisations'] },
          { label: this.translateService.instant('Subdivisions'), icon: 'fa-solid fa-sitemap', routerLink: ['/records/subdivisions'], visible: isDedicated },
          { label: this.translateService.instant('Users'), icon: 'fa-solid fa-users', routerLink: ['/records/users'] },
        ],
      },
      { label: this.translateService.instant('Documents'), icon: 'fa-solid fa-file-lines', routerLink: ['/records', 'documents'], visible: user.is_moderator },
      { label: this.translateService.instant('Research projects'), icon: 'fa-solid fa-chart-gantt', routerLink: ['/records', 'projects'], visible: user.is_submitter },
      {
        label: this.translateService.instant('Deposits'),
        icon: 'fa-solid fa-file-arrow-up',
        visible: user.is_submitter,
        items: [
          { label: this.translateService.instant('Deposit a publication'), icon: 'fa-solid fa-file-circle-plus', routerLink: ['/deposit', 'create'] },
          { label: this.translateService.instant('Deposits'), icon: 'fa-solid fa-list-check', routerLink: ['/records', 'deposits'] },
        ],
      },
      { separator: true },
    ]);

    this.userItems.set([
      {
        label: `${user.last_name}, ${user.first_name}`,
        icon: 'fa-solid fa-user',
        items: [
          { label: this.translateService.instant('Public interface'), icon: 'fa-solid fa-users', url: this.store.getPublicInterfaceLink(), target: 'public' },
          { label: this.translateService.instant('Profile'), icon: 'fa-solid fa-address-card', url: '/users/profile', target: '_self' },
          { label: this.translateService.instant('Super administration'), icon: 'fa-solid fa-screwdriver-wrench', url: '/admin', visible: user.is_superuser, target: 'admin' },
          { label: this.translateService.instant('Logout'), icon: 'fa-solid fa-right-from-bracket', url: '/logout', target: '_self' },
        ],
      },
      {
        label: this.translateService.getCurrentLang().toUpperCase(),
        icon: 'fa-solid fa-language',
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
