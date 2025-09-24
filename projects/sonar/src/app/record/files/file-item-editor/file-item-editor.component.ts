/*
 * SONAR User Interface
 * Copyright (C) 2024 RERO
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

import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { JSONSchemaService, processJsonSchema, resolve$ref } from '@rero/ng-core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'sonar-file-item-editor',
  templateUrl: './file-item-editor.component.html',
  standalone: false
})
export class FileItemEditorComponent implements OnInit{

  formlyJSONSchema: FormlyJsonschema = inject(FormlyJsonschema);
  jsonschemaService: JSONSchemaService = inject(JSONSchemaService);
  dynamicDialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  dynamicDialogRef: DynamicDialogRef = inject(DynamicDialogRef);

 // editor JSONSchema
  schema:any;
 // the formly form
  form: FormGroup = new FormGroup({});
  file: any;
  // editor value
  model: any = {};
  // editor options
  options: FormlyFormOptions = {};
  // formly editor fields
  fields = [];

  ngOnInit(): void {
    this.schema = this.dynamicDialogConfig.data.schema;
    this.file = this.dynamicDialogConfig.data.file;
    this.model = this.file.metadata;
    this.fields = this.createForm();
  }
  /**
   * Create the form editor.
   *
   * @param schema editor JSONSchema
   * @returns the formly fields.
   */
  private createForm() {
    const schema = processJsonSchema(resolve$ref(this.schema, this.schema.properties));
    // form configuration
    const editorConfig = {
      longMode: false,
    };
    return [
      this.formlyJSONSchema.toFieldConfig(schema, {
        map: (field: any, fieldSchema: any) => {
          field = this.jsonschemaService.processField(field, fieldSchema);
          field.props.editorConfig = editorConfig;
          field.props.getRoot = () => this.fields[0];
          return field;
        },
      }),
    ];
  }

  save() {
    if(this.model.embargoDate === null) {
      delete this.model.embargoDate;
      delete this.model.exceptInOrganization;
    }
    this.dynamicDialogRef.close(this.model);
  }
}
