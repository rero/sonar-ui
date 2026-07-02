// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiService, Nl2brPipe } from '@rero/ng-core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { catchError, EMPTY } from 'rxjs';

type CitationStyle = {
  id: string;
  label: string;
  version: string;
};

type Citation = {
  citation: string;
};

@Component({
  selector: 'sonar-citation',
  imports: [Nl2brPipe, Message, TranslatePipe],
  templateUrl: './citation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitationComponent implements OnInit {

  private apiService = inject(ApiService);
  private httpClient = inject(HttpClient);
  private translateService = inject(TranslateService);
  private dynamicDialogConfig = inject(DynamicDialogConfig);
  private clipboard = inject(Clipboard);

  protected styles = signal<CitationStyle[]>([]);
  protected selectedStyle = signal<string>('');
  protected citation = signal<string|undefined>(undefined);
  protected message = signal<string|undefined>(undefined);
  protected messageType = signal<'success' | 'error'>('success');

  private documentPid!: string;

  ngOnInit(): void {
    const { data } = this.dynamicDialogConfig;
    this.documentPid = data.documentPid;
    this.httpClient.get<CitationStyle[]>(`${this.apiService.getEndpointByType('documents', true)}/citation-styles`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.messageType.set('error');
          this.message.set(this.translateService.instant('An error occurred while loading citation styles'));
          console.error('citation-styles error', error);
          return EMPTY;
        })
      )
      .subscribe(result => this.styles.set(result));
  }

  cite(style: string): void {
    this.selectedStyle.set(style);
    this.message.set(undefined);
    this.httpClient.get<Citation>(`${this.apiService.getEndpointByType('documents', true)}/${this.documentPid}/citation?style=${style}`)
      .pipe(
        catchError(() => {
          this.messageType.set('error');
          this.message.set(this.translateService.instant('An error occurred while loading the citation'));
          this.citation.set(undefined);
          this.selectedStyle.set('');
          return EMPTY;
        })
      )
      .subscribe(result => this.citation.set(result.citation));
  }

  copy(): void {
    const citation = this.citation();
    if (citation) {
      this.clipboard.copy(citation);
      this.messageType.set('success');
      this.message.set(this.selectedStyle() + ': ' + this.translateService.instant('The text has been copied to the clipboard'));
    }
  }
}
