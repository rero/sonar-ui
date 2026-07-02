// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApiService, CoreTranslateLoader } from '@rero/ng-core';
import { Clipboard } from '@angular/cdk/clipboard';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CitationComponent } from './citation.component';

const API_BASE = '/api/documents';

const apiServiceMock = {
  getEndpointByType: vi.fn().mockReturnValue(API_BASE)
};

const clipboardMock = {
  copy: vi.fn()
};

const STYLES = [
  { id: 'apa_7', label: 'APA (7th edition)' },
  { id: 'chicago_17', label: 'Chicago (17th edition)' },
];

describe('CitationComponent', () => {
  let component: CitationComponent;
  let fixture: ComponentFixture<CitationComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader }
        }),
        CitationComponent
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: apiServiceMock },
        { provide: Clipboard, useValue: clipboardMock },
        { provide: DynamicDialogConfig, useValue: { data: { documentPid: 'doc-123' } } }
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CitationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
    vi.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`${API_BASE}/citation-styles`).flush(STYLES);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load citation styles on init', () => {
      fixture.detectChanges();
      const req = httpTesting.expectOne(`${API_BASE}/citation-styles`);
      req.flush(STYLES);
      expect(component['styles']()).toEqual(STYLES);
    });

    it('should set error message when citation-styles fails', () => {
      fixture.detectChanges();
      const req = httpTesting.expectOne(`${API_BASE}/citation-styles`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
      expect(component['message']()).toBeTruthy();
      expect(component['messageType']()).toBe('error');
      expect(component['styles']()).toEqual([]);
    });
  });

  describe('cite()', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpTesting.expectOne(`${API_BASE}/citation-styles`).flush(STYLES);
    });

    it('should set selectedStyle and load citation', () => {
      component.cite('apa_7');
      const req = httpTesting.expectOne(`${API_BASE}/doc-123/citation?style=apa_7`);
      req.flush({ citation: 'Author, A. (2024). Title.' });
      expect(component['selectedStyle']()).toBe('apa_7');
      expect(component['citation']()).toBe('Author, A. (2024). Title.');
    });

    it('should clear message before loading citation', () => {
      component['message'].set('previous message');
      component.cite('apa_7');
      expect(component['message']()).toBeUndefined();
      httpTesting.expectOne(`${API_BASE}/doc-123/citation?style=apa_7`).flush({ citation: 'x' });
    });

    it('should set error and reset selectedStyle on citation error', () => {
      component.cite('apa_7');
      const req = httpTesting.expectOne(`${API_BASE}/doc-123/citation?style=apa_7`);
      req.flush({ message: 'Document not found' }, { status: 404, statusText: 'Not Found' });
      expect(component['messageType']()).toBe('error');
      expect(component['message']()).toBeTruthy();
      expect(component['citation']()).toBeUndefined();
      expect(component['selectedStyle']()).toBe('');
    });
  });

  describe('copy()', () => {
    const clipboardWriteMock = vi.fn();

    beforeEach(() => {
      fixture.detectChanges();
      httpTesting.expectOne(`${API_BASE}/citation-styles`).flush(STYLES);
      clipboardWriteMock.mockReset().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { write: clipboardWriteMock } });
      Object.assign(globalThis, {
        Blob: class {
          constructor(public parts: string[], public options: { type: string }) {}
        },
        ClipboardItem: class {
          constructor(public items: Record<string, { parts: string[] }>) {}
          getType(type: string): Promise<{ parts: string[] }> {
            return Promise.resolve(this.items[type]);
          }
        }
      });
    });

    it('should write plain text and html to the clipboard and set success message', async () => {
      component['citation'].set('<i>Author, A.</i> (2024). Title.');
      component['selectedStyle'].set('apa_7');
      component.copy();
      expect(clipboardWriteMock).toHaveBeenCalledTimes(1);
      const [item] = clipboardWriteMock.mock.calls[0][0];
      expect((await item.getType('text/plain')).parts.join('')).toBe('Author, A. (2024). Title.');
      expect((await item.getType('text/html')).parts.join('')).toBe('<i>Author, A.</i> (2024). Title.');
      expect(component['messageType']()).toBe('success');
      expect(component['message']()).toContain('APA (7th edition)');
    });

    it('should fall back to Clipboard.copy when the native clipboard write fails', async () => {
      clipboardWriteMock.mockRejectedValue(new Error('denied'));
      component['citation'].set('Author, A. (2024). Title.');
      component['selectedStyle'].set('apa_7');
      component.copy();
      await Promise.resolve();
      await Promise.resolve();
      expect(clipboardMock.copy).toHaveBeenCalledWith('Author, A. (2024). Title.');
    });

    it('should not copy when citation is undefined', () => {
      component['citation'].set(undefined);
      component.copy();
      expect(clipboardWriteMock).not.toHaveBeenCalled();
      expect(clipboardMock.copy).not.toHaveBeenCalled();
      expect(component['message']()).toBeUndefined();
    });
  });
});
