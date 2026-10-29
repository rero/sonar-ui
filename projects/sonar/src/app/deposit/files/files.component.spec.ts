// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { DialogModule } from '@openng/optimus-ui/dialog';

import { FileLinkPipe } from '../../core/file-link.pipe';
import { FilesComponent } from './files.component';

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogModule, FilesComponent, FileLinkPipe],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesComponent);
    fixture.componentRef.setInput('mainFile', {});
    fixture.componentRef.setInput('depositPid', '1');
    fixture.componentRef.setInput('additionalFiles', {});
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
