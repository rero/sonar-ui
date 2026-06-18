// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreTranslateLoader } from '@rero/ng-core';
import { FileComponent } from './file.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
            loader: {
                provide: BaseTranslateLoader,
                useClass: CoreTranslateLoader,
            },
        }),
        FileComponent
    ],
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('file', {
      key: 'file-key',
      label: 'file-label',
      thumbnail: 'file-thumbnail.jpg',
      links: {
        external: 'external-link',
        preview: 'preview',
        download: 'download'
      },
      restriction: {
        restricted: false,
        date: '2025-01-01'
      }
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
