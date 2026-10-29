import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { CoreTranslateLoader } from '@rero/ng-core';

import { CitationActionComponent } from './citation-action.component';

const dialogServiceMock = {
  open: vi.fn(),
};

describe('CitationActionComponent', () => {
  let component: CitationActionComponent;
  let fixture: ComponentFixture<CitationActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitationActionComponent],
      providers: [
        provideTranslateService({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader },
        }),
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CitationActionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recordData', { pid: 'doc-123' });
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the citation dialog with the record pid', () => {
    component.citation();
    expect(dialogServiceMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: { documentPid: 'doc-123' },
      }),
    );
  });
});
