// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FileLinkPipe } from '../../core/file-link.pipe';
import { FilesComponent } from './files.component';
import { DialogModule } from 'primeng/dialog';

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        TranslateModule.forRoot(),
        DialogModule,
        FilesComponent,
        FileLinkPipe
    ],
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
