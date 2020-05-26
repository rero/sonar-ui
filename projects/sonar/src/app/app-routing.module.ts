/*
 * SONAR User Interface
 * Copyright (C) 2020 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActionStatus, DetailComponent, EditorComponent, RecordSearchComponent } from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BriefViewComponent } from './deposit/brief-view/brief-view.component';
import { ConfirmationComponent } from './deposit/confirmation/confirmation.component';
import { EditorComponent as DepositEditorComponent } from './deposit/editor/editor.component';
import { UploadComponent } from './deposit/upload/upload.component';
import { CanAddGuard } from './guard/can-add.guard';
import { RoleGuard } from './guard/role.guard';
import { AggregationFilter } from './record/document/aggregation-filter';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { DetailComponent as OrganisationDetailComponent } from './record/organisation/detail/detail.component';
import { OrganisationComponent } from './record/organisation/organisation.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { UserComponent } from './record/user/user.component';
import { UserService } from './user.service';
import { AdminComponent } from './_layout/admin/admin.component';

const adminModeDisabled = (): Observable<ActionStatus> => {
  return of({
    can: false,
    message: ''
  });
};

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', component: DashboardComponent },
      {
        path: 'deposit/:id',
        canActivate: [RoleGuard],
        data: {
          role: 'publisher'
        },
        children: [
          {
            path: 'create',
            component: UploadComponent
          },
          {
            path: 'confirmation',
            component: ConfirmationComponent
          },
          {
            path: ':step',
            component: DepositEditorComponent
          }
        ]
      }
    ]
  },
  {
    path: 'organisation/sonar/search',
    loadChildren: () =>
      import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: false,
      adminMode: adminModeDisabled,
      detailUrl: '/organisation/sonar/:type/:pid',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          aggregations: AggregationFilter.filter,
          preFilters: {
            view: 'sonar'
          }
        }
      ]
    }
  },
  {
    path: 'organisation/unisi/search',
    loadChildren: () =>
      import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: false,
      adminMode: adminModeDisabled,
      detailUrl: '/organisation/unisi/:type/:pid',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          aggregations: AggregationFilter.filter,
          preFilters: {
            view: 'unisi'
          }
        }
      ]
    }
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  /**
   * Constructor.
   *
   * Adds routes for resources
   *
   * @param _translateService Translate service.
   */
  constructor(private _translateService: TranslateService, private _router: Router, private _userService: UserService) {
    AggregationFilter.translateService = this._translateService;

    const recordsRoutesConfiguration = [
      {
        type: 'documents',
        briefView: DocumentComponent,
        detailView: DocumentDetailComponent,
        aggregations: AggregationFilter.filter,
        editorLongMode: true
      },
      {
        type: 'users',
        briefView: UserComponent,
        detailView: UserDetailComponent
      },
      {
        type: 'organisations',
        briefView: OrganisationComponent,
        detailView: OrganisationDetailComponent
      },
      {
        type: 'deposits',
        briefView: BriefViewComponent,
        aggregations: AggregationFilter.filter
      }
    ];

    recordsRoutesConfiguration.forEach((config: any) => {
      const route = {
        matcher: (url: any) => this._routeMatcher(url, config.type),
        canActivate: [RoleGuard],
        children: [
          { path: '', component: RecordSearchComponent },
          { path: 'detail/:pid', component: DetailComponent },
          { path: 'edit/:pid', component: EditorComponent },
          { path: 'new', component: EditorComponent, canActivate: [CanAddGuard] }
        ],
        data: {
          role: 'publisher',
          showSearchInput: true,
          types: [
            {
              key: config.type,
              label: config.type.charAt(0).toUpperCase() + config.type.slice(1),
              component: config.briefView || null,
              editorLongMode: config.editorLongMode || false,
              detailComponent: config.detailView || null,
              aggregations: config.aggregations || null,
              canAdd: () => this._can(config.type, 'add'),
              canUpdate: (record: any) => this._can(config.type, 'update', record),
              canDelete: (record: any) => this._can(config.type, 'delete', record),
              canRead: (record: any) => this._can(config.type, 'read', record)
            }
          ]
        }
      };

      this._router.config[0].children.push(route);
    });
  }

  /**
   * Check if resource of given type can do the given action.
   *
   * @param resource Resource type.
   * @param action Action to check.
   * @param record Record dict.
   * @return Observable
   */
  private _can(resource: string, action: string, record: any = null): Observable<ActionStatus> {
    if (resource === 'deposits' && ['add', 'update'].includes(action)) {
      return of({ can: false, message: '' });
    }

    if (record) {
      return of({ can: record.metadata.permissions[action], message: '' });
    }

    return this._userService.user$.pipe(
      map((user: any) => {
        return { can: user.permissions[resource][action], message: '' };
      })
    );
  }

  /**
   * Route matcher for matching route with a resource type.
   *
   * @param url URL parts for the route.
   * @param type Resource type.
   * @returns The matched URL if found or null.
   */
  private _routeMatcher(url: any, type: string) {
    if (url[0].path === 'records' && url[1].path === type) {
      return this._matchedUrl(url);
    }
    return null;
  }

  /**
   * Matched url
   *
   * @param url UrlSegment
   * @returns Object containing the matched URL.
   */
  private _matchedUrl(url: UrlSegment[]) {
    const segments = [
      new UrlSegment(url[0].path, {}),
      new UrlSegment(url[1].path, {})
    ];
    return {
      consumed: segments,
      posParams: { type: new UrlSegment(url[1].path, {}) }
    };
  }
}
