// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreTranslateLoader } from '@rero/ng-core';
import { DialogService } from 'primeng/dynamicdialog';
import { CitationComponent } from '../citation/citation.component';
import { DocumentActionsComponent } from './document-actions.component';

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
      providers: [DialogService]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentActionsComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    fixture.componentRef.setInput('recordData', { pid: 'doc-123' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
