/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, RecordModule } from '@rero/ng-core';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ToastrModule } from 'ngx-toastr';
import { AppConfigService } from './app-config.service';
import { AppInitializerService } from './app-initializer.service';
import { AppRoutingModule } from './app-routing.module';
import { AppTranslateLoader } from './app-translate-loader';
import { AppComponent } from './app.component';
import { FileLinkPipe } from './core/file-link.pipe';
import { FileSizePipe } from './core/filesize.pipe';
import { HighlightJsonPipe } from './core/highlight-json.pipe';
import { JoinPipe } from './core/join.pipe';
import { StepComponent } from './core/step/step.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BriefViewComponent } from './deposit/brief-view/brief-view.component';
import { ConfirmationComponent } from './deposit/confirmation/confirmation.component';
import { EditorComponent } from './deposit/editor/editor.component';
import { ReviewComponent } from './deposit/review/review.component';
import { UploadComponent } from './deposit/upload/upload.component';
import { HttpInterceptor } from './interceptor/http.interceptor';
import { LanguageValuePipe } from './pipe/language-value.pipe';
import { BriefViewComponent as CollectionBriefViewComponent } from './record/collection/brief-view/brief-view.component';
import { DetailComponent as CollectionDetailComponent } from './record/collection/detail/detail.component';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { FileComponent } from './record/document/file/file.component';
import { PublicationPipe } from './record/document/publication.pipe';
import { DetailComponent as HepvsProjectDetailComponent } from './record/hepvs/project/detail/detail.component';
import { IdentifierComponent } from './record/identifier/identifier.component';
import { DetailComponent as OrganisationDetailComponent } from './record/organisation/detail/detail.component';
import { OrganisationComponent } from './record/organisation/organisation.component';
import { BriefViewComponent as ProjectBriefViewComponent } from './record/project/brief-view/brief-view.component';
import { DetailComponent as ProjectDetailComponent } from './record/project/detail/detail.component';
import { BriefViewComponent as SubdivisionBriefViewComponent } from './record/subdivision/brief-view/brief-view.component';
import { DetailComponent as SubdivisionDetailComponent } from './record/subdivision/detail/detail.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { UserComponent } from './record/user/user.component';
import { ValidationComponent } from './record/validation/validation.component';
import { UserService } from './user.service';
import { AdminComponent } from './_layout/admin/admin.component';

export function appInitializerFactory(appInitializerService: AppInitializerService): () => Promise<any> {
  return () => appInitializerService.initialize().toPromise();
}

export function minElementError(err: any, field: FormlyFieldConfig) {
  return `This field must contain at least ${field.templateOptions.minItems} element.`;
}

@NgModule({
  declarations: [
    AppComponent,
    OrganisationComponent,
    DocumentComponent,
    UserComponent,
    DocumentDetailComponent,
    OrganisationDetailComponent,
    UserDetailComponent,
    JoinPipe,
    LanguageValuePipe,
    DashboardComponent,
    UploadComponent,
    FileSizePipe,
    EditorComponent,
    StepComponent,
    ConfirmationComponent,
    BriefViewComponent,
    FileLinkPipe,
    HighlightJsonPipe,
    ReviewComponent,
    AdminComponent,
    PublicationPipe,
    FileComponent,
    ProjectBriefViewComponent,
    ProjectDetailComponent,
    IdentifierComponent,
    HepvsProjectDetailComponent,
    ValidationComponent,
    CollectionBriefViewComponent,
    CollectionDetailComponent,
    SubdivisionBriefViewComponent,
    SubdivisionDetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: BaseTranslateLoader,
        useClass: AppTranslateLoader,
        deps: [CoreConfigService, HttpClient, UserService]
      },
      defaultLanguage: 'en'
    }),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgxDropzoneModule,
    RecordModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true
    },
    {
      provide: CoreConfigService,
      useClass: AppConfigService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [
        AppInitializerService,
        UserService
      ],
      multi: true
    },
    BsLocaleService,
    DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
