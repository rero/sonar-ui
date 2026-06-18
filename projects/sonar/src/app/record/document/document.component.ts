// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DetailUrl, KatexDirective, ReadMoreComponent, Nl2brPipe, RecordData } from '@rero/ng-core';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../../app-config.service';
import { DocumentFile } from './document.interface';
import { FileComponent } from './file/file.component';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { ContributionComponent } from './contribution/contribution.component';
import { AsyncPipe, SlicePipe, KeyValuePipe } from '@angular/common';
import { LanguageValuePipe } from '../../pipe/language-value.pipe';
import { PublicationPipe } from './publication.pipe';
import { ContributorsPipe } from '../../pipe/contributors.pipe';

const SORT_CONTRIBUTOR_PRIORITY = ['cre', 'ctb', 'dgs', 'edt', 'prt'];

@Component({
    templateUrl: './document.component.html',
    imports: [FileComponent, RouterLink, Bind, Tag, ContributionComponent, KatexDirective, ReadMoreComponent, AsyncPipe, SlicePipe, KeyValuePipe, TranslatePipe, Nl2brPipe, LanguageValuePipe, PublicationPipe, ContributorsPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentComponent implements OnDestroy {

  private configService: AppConfigService = inject(AppConfigService);
  private translateService: TranslateService = inject(TranslateService);

  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();

  abstract = signal<string>('');

  showMore = signal<boolean>(true);

  isGlobalView = computed(() => this.configService.view === null
      || this.configService.view === this.configService.globalviewName);

  view = computed(() => this.configService.view);

  mainFile = computed<DocumentFile | null>(() => {
    const files = (this.record().metadata as Record<string, unknown>)._files as Record<string, unknown>[];
    if (!files?.length) {
      return null;
    }
    const file = files.find((f) => f['type'] === 'file');
    return file ? file as unknown as DocumentFile : null;
  });

  sortedContributions = computed(() => {
    const meta = this.record().metadata as Record<string, unknown>;
    const contributions = (meta.contribution as Record<string, unknown>[]) ?? [];
    return [...contributions].sort((a, b) => {
      const aIndex = SORT_CONTRIBUTOR_PRIORITY.findIndex((role) => (a['role'] as unknown[])[0] === role);
      const bIndex = SORT_CONTRIBUTOR_PRIORITY.findIndex((role) => (b['role'] as unknown[])[0] === role);
      return aIndex === bIndex ? 0 : aIndex < bIndex ? -1 : 1;
    });
  });

  contributorsLength = computed(() =>
    this.showMore() ? 5 : this.sortedContributions().length
  );

  private subscription: Subscription = new Subscription();

  constructor() {
    effect(() => {
      this.record();
      this._updateAbstract();
    });
    this.subscription.add(
      this.translateService.onLangChange.subscribe(() => this._updateAbstract())
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  showMoreContributors(event: MouseEvent): void {
    event.preventDefault();
    this.showMore.set(false);
  }

  private _updateAbstract(): void {
    const abstracts = (this.record().metadata as Record<string, unknown>).abstracts as Record<string, unknown>[];
    if (!abstracts?.length) {
      return;
    }
    const currentBibCode = this.configService.languagesMap.find(
      (item) => item.code === this.translateService.getCurrentLang()
    )?.bibCode;
    const abstract = abstracts.find((item) => item['language'] === currentBibCode);
    this.abstract.set(abstract ? abstract['value'] as string : abstracts[0]['value'] as string);
  }
}
