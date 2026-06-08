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
import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { KatexDirective, RecordData, RecordService, RecordType, Nl2brPipe, TranslateLanguagePipe } from '@rero/ng-core';
import { Subscription, of, switchMap, tap } from 'rxjs';

import { RecordFile } from '../../files/upload-files/upload-files.component';
import { AppConfigService } from '../../../app-config.service';
import { DocumentFile } from '../document.interface';
import { FileComponent } from '../file/file.component';
import { Tooltip } from 'primeng/tooltip';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { ContributionsComponent } from './contributions/contributions.component';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Ripple } from 'primeng/ripple';
import { ScrollPanel } from 'primeng/scrollpanel';
import { FieldDescriptionComponent } from '../../../core/field-description/field-description.component';
import { PrimeTemplate } from 'primeng/api';
import { IdentifierComponent } from '../../identifier/identifier.component';
import { UploadFilesComponent } from '../../files/upload-files/upload-files.component';
import { StatsFilesComponent } from '../../files/stats-files/stats-files.component';
import { OtherFilesComponent } from '../../files/other-files/other-files.component';
import { Dialog } from 'primeng/dialog';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { JoinPipe } from '../../../core/join.pipe';
import { LanguageValuePipe } from '../../../pipe/language-value.pipe';
import { LicensePipe } from '../license.pipe';

@Component({
    templateUrl: './detail.component.html',
    imports: [
        FileComponent,
        KatexDirective,
        Tooltip,
        Bind,
        Tag,
        ContributionsComponent,
        RouterLink,
        Tabs,
        TabList,
        Ripple,
        Tab,
        TabPanels,
        TabPanel,
        ScrollPanel,
        FieldDescriptionComponent,
        PrimeTemplate,
        IdentifierComponent,
        UploadFilesComponent,
        StatsFilesComponent,
        OtherFilesComponent,
        Dialog,
        AsyncPipe,
        KeyValuePipe,
        TranslatePipe,
        Nl2brPipe,
        TranslateLanguagePipe,
        JoinPipe,
        LanguageValuePipe,
        LicensePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent implements OnDestroy {

  private configService: AppConfigService = inject(AppConfigService);
  private translateService: TranslateService = inject(TranslateService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private recordService = inject(RecordService);
  private route = inject(ActivatedRoute);

  record = input.required<RecordData>();
  type = input<string>();

  private typeConfig = computed<RecordType | null>(() => {
    const data = this.route.snapshot.data;
    if (data['types']?.length) {
      return (data['types'] as RecordType[]).find((t) => t.key === 'documents') ?? null;
    }
    let current = this.route.parent;
    while (current) {
      const types = (current.snapshot.data['types'] ?? []) as RecordType[];
      if (types.length) {
        return types.find((t) => t.key === 'documents') ?? null;
      }
      current = current.parent;
    }
    return null;
  });

  canUpdate = toSignal(
    toObservable(this.record).pipe(
      switchMap((record) => {
        const config = this.typeConfig();
        if (config?.canUpdate) {
          return config.canUpdate(record);
        }
        const perms = (record.metadata as Record<string, unknown>)?.['permissions'] as Record<string, unknown> | undefined;
        return of({ can: !!(perms?.['update']), message: '' });
      })
    ),
    { initialValue: { can: false, message: '' } }
  );

  previewFile = signal<{ label: string; url: unknown } | null>(null);

  isShowPreview = signal<boolean>(false);

  // Resolved record metadata as a writable signal for local mutations (abstracts sorting).
  recordData = signal<Record<string, unknown>>({});

  filteredFiles = computed(() => this.getFilteredFiles());

  mainFile = computed(() => this.filteredFiles().length === 0 ? null : this.filteredFiles()[0]);

  // File count updated immediately from the upload component's filesChanged event.
  filesCount = signal<number>(0);

  // True once the upload component has emitted at least once — prevents onRecordChange from overriding.
  private filesCountInitialized = false;

  initialTab = computed(() => this.canUpdate().can ? 'edit' : 'stats');

  // Subscription to observables, used to unsubscribe to all at the same time.
  private subscription: Subscription = new Subscription();

  constructor() {
    effect(() => {
      const record = this.record();
      if (record) {
        this.onRecordChange(record);
        if (!this.filesCountInitialized) {
          this.filesCount.set(untracked(() => this.getFilteredFiles().length));
        }
      }
    });
    this.subscription.add(
      this.translateService.onLangChange.subscribe(() => this.sortAbstracts())
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private onRecordChange(record: RecordData): void {
    const meta = record.metadata as Record<string, unknown>;
    this.recordData.set(meta);
    const rec = this.recordData();
    if (!rec['abstracts']) {
      rec['abstracts'] = [];
    }
    this.sortAbstracts();
    (rec['abstracts'] as Record<string, unknown>[]).forEach((element: Record<string, unknown>, index: number) => {
      element['show'] = index === 0;
      element['full'] = false;
    });
  }

  updateFiles(files: RecordFile[]): void {
    this.filesCountInitialized = true;
    this.filesCount.set(files.length);
    this.recordService
      .getRecord('documents', this.recordData().pid as string, { resolve: 1 })
      .pipe(tap((doc) => this.recordData.set({ ...this.recordData(), _files: doc.metadata['_files'] })))
      .subscribe();
  }

  /**
   * Scroll to target.
   *
   * @param event DOM event triggered.
   * @param target ID of the target element.
   */
  goToOtherFile(event: MouseEvent, target: string): void {
    event.preventDefault();
    document.querySelector('#' + target)?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Show a preview in modal for file.
   *
   * @param file Document file object.
   */
  showPreview(file: DocumentFile): void {
    this.previewFile.set({
      label: file.label,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(file.links.preview),
    });
    this.isShowPreview.set(true);
  }

  /**
   * Return the formatted string for funding organisations.
   *
   * @param project Project record.
   * @returns String representing the funding organisations.
   */
  getFundingOrganisations(project: Record<string, unknown>): string {
    if (!project['funding_organisations']) {
      return '';
    }

    const text = (project['funding_organisations'] as { agent: { preferred_name: string } }[]).map((item) => {
      return item.agent.preferred_name;
    });

    return `(${this.translateService.instant(
      'supported by {{ organisations }}',
      { organisations: text.join(', ') }
    )})`;
  }

  /**
   * Get only files of type "file" (exclude fulltext and thumbnail files).
   *
   * @return List of item filtered.
   */
  private getFilteredFiles(): DocumentFile[] {
    if (!this.recordData()['_files']) {
      return [];
    }

    return (this.recordData()['_files'] as DocumentFile[]).filter((item: DocumentFile) => {
      return (item as unknown as Record<string, unknown>)['type'] === 'file';
    });
  }

  /**
   * Sort abstracts by language prioritization. First language is the current
   * language of the interface.
   */
  private sortAbstracts(): void {
    const rec = this.recordData();
    if (!rec || !rec['abstracts']) {
      return;
    }

    const abstractsLanguage: Record<string, unknown>[] = [];
    const abstractsCode: Record<string, unknown>[] = [];
    (rec['abstracts'] as Record<string, unknown>[]).map((abstract: Record<string, unknown>) => {
      if (
        this.configService.languagesMap.find(
          (map: { code: string; bibCode: string }) =>
            map.bibCode === abstract['language']
        )
      ) {
        abstractsLanguage.push(abstract);
      } else {
        abstractsCode.push(abstract);
      }
    });

    const firstLanguage = this.configService.languagesMap.find(
      (item) => item.code === this.translateService.currentLang
    );
    const languagesPriorities = [firstLanguage, ...this.configService.languagesMap];

    rec['abstracts'] = abstractsLanguage
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const aIndex = languagesPriorities.findIndex(
          (lang) => lang && a['language'] === lang.bibCode
        );
        const bIndex = languagesPriorities.findIndex(
          (lang) => lang && b['language'] === lang.bibCode
        );
        if (aIndex === bIndex) {
          return 0;
        }
        return aIndex < bIndex ? -1 : 1;
      })
      .concat(
        abstractsCode.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a['language'] as string).localeCompare(b['language'] as string)
        )
      );
  }
}
