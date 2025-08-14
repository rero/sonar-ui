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
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { RecordService } from '@rero/ng-core';
import { Observable, Subscription, map } from 'rxjs';
import { AppConfigService } from '../../../app-config.service';
import { DocumentFile } from '../document.interface';

@Component({
  templateUrl: './detail.component.html',
  standalone: false,
})
export class DetailComponent implements OnDestroy, OnInit {

  private configService: AppConfigService = inject(AppConfigService);
  private translateService: TranslateService = inject(TranslateService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private recordService = inject(RecordService);

  /** Observable resolving record data */
  record$: Observable<any>;

  previewFile = signal(null);

  isShowPreview = signal<boolean>(false);

  // Record retrieved from observable.
  record = signal<any|null>(null);

  filteredFiles = computed(() => this.getFilteredFiles());

  filteredKeys = computed(() => this.filteredFiles().map((file) => file.key));

  mainFile = computed(() => this.filteredFiles().length === 0 ? null : this.filteredFiles()[0]);

  // Subscription to observables, used to unsubscribe to all at the same time.
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.record$.subscribe((record: any) => {
      this.record.set(record.metadata);

      // Add property to abstracts for show more functionality.
      if (!this.record().abstracts) {
        this.record().abstracts = [];
      }
      this.sortAbstracts();
      this.record().abstracts.map((element: any, index: number) => {
        element.show = index === 0;
        element.full = false;
        return element;
      });
    });

    // When language change, abstracts are sorted and first one is displayed.
    this.subscription.add(
      this.translateService.onLangChange.subscribe(() => {
        this.sortAbstracts();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateFiles(): void {
    this.recordService
      .getRecord('documents', this.record().pid, 1)
      .pipe(map((doc) => (this.record()._files = doc.metadata._files)))
      .subscribe();
  }

  /**
   * Scroll to target.
   *
   * @param event DOM event triggered.
   * @param target ID of the target element.
   */
  goToOtherFile(event: any, target: string): void {
    event.preventDefault();
    document.querySelector('#' + target).scrollIntoView({ behavior: 'smooth' });
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
  getFundingOrganisations(project: any): string {
    if (!project.funding_organisations) {
      return '';
    }

    const text = project.funding_organisations.map((item: any) => {
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
  private getFilteredFiles(): any[] {
    if (!this.record()._files) {
      return [];
    }

    return this.record()._files.filter((item: any) => {
      return item.type === 'file';
    });
  }

  /**
   * Sort abstracts by language prioritization. First language is the current
   * language of the interface.
   */
  private sortAbstracts(): void {
    if (!this.record() || !this.record().abstracts) {
      return;
    }

    const abstractsLanguage = [];
    const abstractsCode = [];
    this.record().abstracts.map((abstract: any) => {
      if (
        this.configService.languagesMap.find(
          (map: { code: string; bibCode: string }) =>
            map.bibCode === abstract.language
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
    const languagesPriorities = [firstLanguage].concat(
      this.configService.languagesMap
    );

    this.record().abstracts = abstractsLanguage
      .sort((a: any, b: any) => {
        const aIndex = languagesPriorities.findIndex(
          (lang) => a.language === lang.bibCode
        );
        const bIndex = languagesPriorities.findIndex(
          (lang) => b.language === lang.bibCode
        );
        if (aIndex === bIndex) {
          return 0;
        }
        return aIndex < bIndex ? -1 : 1;
      })
      .concat(
        abstractsCode.sort((a: any, b: any) =>
          a.language.localeCompare(b.language)
        )
      );
  }
}
