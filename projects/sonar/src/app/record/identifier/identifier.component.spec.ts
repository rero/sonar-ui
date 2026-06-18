// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import { IdentifierComponent } from './identifier.component';
import { TagModule } from 'primeng/tag';

describe('IdentifierComponent', () => {
  let component: IdentifierComponent;
  let fixture: ComponentFixture<IdentifierComponent>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appConfigServiceSpy = {} as any;
  appConfigServiceSpy.settings = {
    document_identifier_link: {
      'bf:Local': {
        swisscovery: 'https://link_to_swisscovery'
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: BaseTranslateLoader,
                useClass: CoreTranslateLoader,
            }
        }),
        TagModule,
        IdentifierComponent
    ],
    providers: [
        { provide: CoreConfigService, useClass: AppConfigService },
        { provide: AppConfigService, useValue: appConfigServiceSpy },
        provideHttpClient(withInterceptorsFromDi())
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifierComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'identifiedBy');
    fixture.componentRef.setInput('data', {
      type: 'bf:Local',
      value: '0000-1111111',
      source: 'swisscovery'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
