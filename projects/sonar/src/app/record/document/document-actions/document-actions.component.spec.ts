// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApiService, CoreTranslateLoader } from '@rero/ng-core';
import { DialogService } from 'primeng/dynamicdialog';
import { AppStore } from '../../../store/app.store';
import { CitationComponent } from '../citation/citation.component';
import { DocumentActionsComponent } from './document-actions.component';

const API_BASE = '/api/documents';

const apiServiceMock = {
  getEndpointByType: vi.fn().mockReturnValue(API_BASE)
};

const EXPORT_FORMATS = [
  { format: 'bibtex', icon: 'fa-file-text-o' },
  { format: 'ris', icon: 'fa-file-text-o' },
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
  let dialogService: DialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader }
        }),
        DocumentActionsComponent
      ],
      providers: [
        DialogService,
        { provide: ApiService, useValue: apiServiceMock },
        { provide: AppStore, useValue: appStoreMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentActionsComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
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
      expect(component.exportUrl('bibtex')).toBe(`${API_BASE}/doc-123/export/bibtex`);
    });

    it('should use the pid from recordData', () => {
      fixture.componentRef.setInput('recordData', { pid: 'other-pid' });
      expect(component.exportUrl('ris')).toBe(`${API_BASE}/other-pid/export/ris`);
    });
  });

  describe('citation()', () => {
    it('should open dialog with CitationComponent', () => {
      const openSpy = vi.spyOn(dialogService, 'open');
      component.citation();
      expect(openSpy).toHaveBeenCalledWith(CitationComponent, expect.objectContaining({
        modal: true,
        closable: true,
      }));
    });

    it('should pass documentPid from recordData to the dialog', () => {
      const openSpy = vi.spyOn(dialogService, 'open');
      component.citation();
      expect(openSpy).toHaveBeenCalledWith(CitationComponent, expect.objectContaining({
        data: { documentPid: 'doc-123' }
      }));
    });
  });
});
