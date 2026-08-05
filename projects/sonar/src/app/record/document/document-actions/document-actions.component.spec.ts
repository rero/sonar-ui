// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApiService, CoreTranslateLoader } from '@rero/ng-core';
import { AppStore } from '../../../store/app.store';
import { DocumentActionsComponent } from './document-actions.component';

const API_BASE = '/api/documents';

const apiServiceMock = {
  getEndpointByType: vi.fn().mockReturnValue(API_BASE)
};

const EXPORT_FORMATS = [
  { format: 'bibtex', icon: 'fa-file-text-o', label: 'BibTeX' },
  { format: 'ris', icon: 'fa-file-text-o', label: 'RIS' },
];

const appStoreMock = {
  settings: signal({
    document_identifier_link: {},
    document_serializers: EXPORT_FORMATS,
  })
};

describe('DocumentActionsComponent', () => {
  let component: DocumentActionsComponent;
  let fixture: ComponentFixture<DocumentActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader }
        }),
        DocumentActionsComponent
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: AppStore, useValue: appStoreMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentActionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recordData', { pid: 'doc-123' });
    fixture.detectChanges();
  });

  afterEach(() => vi.clearAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('exportFormats', () => {
    it('should return serializers from store settings', () => {
      expect(component.exportFormats()).toEqual(EXPORT_FORMATS);
    });

    it('should return empty array when settings is null', () => {
      appStoreMock.settings.set(null as unknown as ReturnType<typeof appStoreMock.settings>);
      expect(component.exportFormats()).toEqual([]);
      appStoreMock.settings.set({ document_identifier_link: {}, document_serializers: EXPORT_FORMATS });
    });
  });

  describe('exportUrl()', () => {
    it('should build correct export URL', () => {
      expect(component.exportUrl('bibtex')).toBe(`${API_BASE}/doc-123?format=bibtex`);
    });

    it('should use the pid from recordData', () => {
      fixture.componentRef.setInput('recordData', { pid: 'other-pid' });
      expect(component.exportUrl('ris')).toBe(`${API_BASE}/other-pid?format=ris`);
    });
  });
});
