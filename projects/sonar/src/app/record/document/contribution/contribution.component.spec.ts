// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreTranslateLoader } from '@rero/ng-core';
import { ActivatedRoute } from '@angular/router';
import { IContribution } from '../contribution.interface';
import { ContributionComponent } from './contribution.component';

const CONTRIBUTOR: IContribution = {
  agent: { type: 'bf:Person', preferred_name: 'Lea Weber' },
  role: ['cre'],
};

const buildActivatedRoute = (paramMaps: Record<string, string>[]): ActivatedRoute => {
  let route: { snapshot: { paramMap: { get: (key: string) => string | null } }; parent: unknown } | null = null;
  for (const params of [...paramMaps].reverse()) {
    route = {
      snapshot: { paramMap: { get: (key: string) => params[key] ?? null } },
      parent: route,
    };
  }
  return route as unknown as ActivatedRoute;
};

describe('ContributionComponent', () => {
  let fixture: ComponentFixture<ContributionComponent>;

  const createComponent = async (activatedRoute: ActivatedRoute) => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: BaseTranslateLoader, useClass: CoreTranslateLoader }
        }),
        ContributionComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContributionComponent);
    fixture.componentRef.setInput('contributor', CONTRIBUTOR);
  };

  describe('route()', () => {
    it('should build the public search link from the :view route param when no [view] input is set', async () => {
      await createComponent(buildActivatedRoute([{ view: 'global' }, {}]));
      fixture.detectChanges();

      expect(fixture.componentInstance.route()).toEqual(['/', 'global', 'search', 'documents']);
    });

    it('should walk up parent routes to find the :view param', async () => {
      await createComponent(buildActivatedRoute([{ view: 'global' }, { pid: '546' }]));
      fixture.detectChanges();

      expect(fixture.componentInstance.route()).toEqual(['/', 'global', 'search', 'documents']);
    });

    it('should build the admin route when no :view param is found anywhere', async () => {
      await createComponent(buildActivatedRoute([{ pid: '546' }]));
      fixture.detectChanges();

      expect(fixture.componentInstance.route()).toEqual(['/records', 'documents']);
    });

    it('should prefer the explicit [view] input over the route param', async () => {
      await createComponent(buildActivatedRoute([{ view: 'global' }]));
      fixture.componentRef.setInput('view', 'dedicated-org');
      fixture.detectChanges();

      expect(fixture.componentInstance.route()).toEqual(['/', 'dedicated-org', 'search', 'documents']);
    });
  });
});
