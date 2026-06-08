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

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { JSONSchemaService, processJsonSchema, resolve$ref } from '@rero/ng-core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormlyModule } from '@ngx-formly/core';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'sonar-file-item-editor',
    templateUrl: './file-item-editor.component.html',
    imports: [FormlyModule, Bind, Button, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileItemEditorComponent {

  private readonly formlyJSONSchema = inject(FormlyJsonschema);
  private readonly jsonschemaService = inject(JSONSchemaService);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly dynamicDialogRef = inject(DynamicDialogRef);

  readonly form = new FormGroup({});
  readonly options: FormlyFormOptions = {};
  readonly model = signal<Record<string, unknown>>(
    this.dynamicDialogConfig.data.file.metadata as Record<string, unknown>
  );
  readonly fields = signal<FormlyFieldConfig[]>(this.createForm());

  private createForm(): FormlyFieldConfig[] {
    const schema = this.dynamicDialogConfig.data.schema as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedSchema = processJsonSchema(resolve$ref(schema as any, (schema.properties as any)));
    const editorConfig = { longMode: false };
    return [
      this.formlyJSONSchema.toFieldConfig(processedSchema, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map: (field: FormlyFieldConfig, fieldSchema: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field = this.jsonschemaService.processField(field as any, fieldSchema) as unknown as FormlyFieldConfig;
          field.props!.editorConfig = editorConfig;
          field.props!.getRoot = () => this.fields()[0];
          return field;
        },
      }),
    ];
  }

  save(): void {
    const model = this.model();
    if (model.embargoDate === null) {
      delete model.embargoDate;
      delete model.exceptInOrganization;
    }
    this.dynamicDialogRef.close(model);
  }
}
