/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {
  CONFIG,
  JSONSchemaService,
  processJsonSchema,
  resolve$ref,
} from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { tap } from 'rxjs/operators';
import { AppStore, AppStoreType } from '../../store/app.store';
import { DepositStore, DepositStoreType } from '../deposit.store';
import { FormlyModule } from '@ngx-formly/core';
import { Bind } from 'primeng/bind';
import { SplitButton } from 'primeng/splitbutton';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { SwisscoveryComponent } from './swisscovery/swisscovery.component';

@Component({
    selector: 'sonar-deposit-editor',
    templateUrl: './editor.component.html',
    imports: [
        FormlyModule,
        Bind,
        SplitButton,
        Button,
        Dialog,
        SwisscoveryComponent,
        TranslatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  private messageService: MessageService = inject(MessageService);
  private router = inject(Router);
  private formlyJsonschema = inject(FormlyJsonschema);
  private translateService = inject(TranslateService);
  private appStore = inject(AppStore) as AppStoreType;
  private spinner = inject(NgxSpinnerService);
  private jsonschemaService = inject(JSONSchemaService);
  private confirmationService = inject(ConfirmationService);

  protected store = inject(DepositStore) as DepositStoreType;
  private destroyRef = inject(DestroyRef);

  currentStep = input.required<string>();
  steps = input.required<string[]>();

  form = signal<UntypedFormGroup>(new UntypedFormGroup({}));
  model = signal<Record<string, unknown>>({});
  fields = signal<FormlyFieldConfig[]>([]);
  importModalIsVisible = signal(false);

  isAdminUser = computed(() => this.appStore.hasRole(['superuser', 'admin', 'moderator']));

  nextStep = computed(() => this.getNextStep());

  canSubmit = computed(() => {
    const deposit = this.store.deposit();
    return deposit !== null
      && ['in_progress', 'ask_for_changes'].includes(deposit.status)
      && this.currentStep() === 'diffusion'
      && deposit.diffusion?.license !== undefined;
  });

  importMenuItems = computed(() => {
    const items: { label: string; command: () => void }[] = [
      {
        label: this.translateService.instant('Import from swisscovery'),
        command: () => this.importModalIsVisible.set(true),
      },
    ];
    if (this.store.mainFile()) {
      items.push({
        label: this.translateService.instant('Analyze uploaded PDF'),
        command: () => this.confirmPdfImport(),
      });
    }
    return items;
  });

  constructor() {
    this.store.loadSchema('deposits').pipe(takeUntilDestroyed()).subscribe();

    effect(() => {
      const schema = this.store.schema();
      const deposit = this.store.deposit();
      if (!schema || !deposit) return;

      const depositFields = this.getDepositFields(schema);
      this.fields.set(this.getFormFields(depositFields.fieldGroup ?? [], this.currentStep()));

      const currentStepData = deposit[this.currentStep()];
      const newModel: Record<string, unknown> = {};
      if (currentStepData) {
        newModel[this.currentStep()] = currentStepData;
      }
      this.model.set(newModel);
    });
  }

  save(): void {
    this.form().updateValueAndValidity();
    if (!this.form().valid) {
      this.form().markAllAsTouched();
      return;
    }
    const deposit = this.store.deposit()!;
    const nextStep = this.nextStep();
    const upgradedStep = this.getUpgradedStep(deposit.step, nextStep);
    const updateData: Record<string, unknown> = {
      ...deposit,
      [this.currentStep()]: this.model()[this.currentStep()],
      step: upgradedStep,
    };
    this.store.update(deposit.pid, updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.messageService.add({
            severity: 'success',
            detail: this.translateService.instant('Deposit saved'),
            life: CONFIG.MESSAGE_LIFE,
          });
          if (this.currentStep() !== this.steps()[this.steps().length - 1]) {
            this.router.navigate(['deposit', deposit.pid, nextStep]);
          }
        }
      });
  }

  confirmPublish(): void {
    this.confirmationService.confirm({
      message: this.translateService.instant('Do you really want to publish this document ?'),
      header: this.translateService.instant('Confirmation'),
      rejectButtonStyleClass: 'p-button-text',
      closable: false,
      accept: () => {
        this.publish();
      },
    });
  }

  publish(): void {
    this.spinner.show();
    this.store.publish(this.store.deposit()!.pid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.spinner.hide();
        this.router.navigate(['deposit', this.store.deposit()!.pid, 'confirmation']);
      });
  }

  confirmPdfImport(): void {
    this.confirmationService.confirm({
      message: this.translateService.instant(
        'Do you really want to extract metadata from PDF and overwrite current data ?'
      ),
      header: this.translateService.instant('Confirmation'),
      closable: false,
      accept: () => {
        this.extractPdfMetadata();
      },
    });
  }

  extractPdfMetadata(): void {
    this.spinner.show();
    this.store
      .extractPDFMetadata(this.store.deposit()!)
      .pipe(
        tap((result: Record<string, unknown> | false) => {
          if (!result) return;
          const metadata: Record<string, unknown> = {};
          ['title', 'documentDate', 'publication', 'abstract', 'languages'].forEach((field) => {
            if (result[field]) {
              switch (field) {
                case 'abstract':
                  metadata['abstracts'] = [
                    {
                      language: (result['languages'] as string[])[0] || 'eng',
                      abstract: result['abstract'],
                    },
                  ];
                  break;
                case 'languages':
                  metadata['language'] = (result['languages'] as string[])[0];
                  break;
                default:
                  metadata[field] = result[field];
              }
            }
          });
          const updates: Record<string, unknown> = {};
          if (Object.keys(metadata).length) updates['metadata'] = metadata;
          if (result['authors']) updates['contributors'] = result['authors'];
          if (Object.keys(updates).length) {
            this.store.mergeDeposit(updates);
          }
        })
      )
      .subscribe({
        next: () => this.spinner.hide(),
        error: () => this.spinner.hide(),
      });
  }

  mapSwisscoveryRecord(data: Record<string, unknown> | null): void {
    this.importModalIsVisible.set(false);
    if (!data) return;
    this.store.mergeDeposit(data);
  }

  private getNextStep(): string {
    const currentIndex = this.steps().findIndex((element) => element === this.currentStep());
    return this.steps()[currentIndex + 1] ?? this.steps()[currentIndex];
  }

  private getUpgradedStep(depositStep: string | undefined, nextStep: string): string {
    const depositIndex = this.steps().findIndex((step) => step === depositStep);
    const nextIndex = this.steps().findIndex((step) => step === nextStep);
    return depositIndex < nextIndex ? nextStep : (depositStep ?? this.steps()[0]);
  }

  private getDepositFields(schema: object): FormlyFieldConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema = processJsonSchema(resolve$ref(schema as any, (schema as any).properties));
    const editorConfig = {
      pid: this.store.deposit()!.pid,
      longMode: false,
      recordType: 'deposits',
    };
    return this.formlyJsonschema.toFieldConfig(schema, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map: (field: FormlyFieldConfig, fieldSchema: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field = this.jsonschemaService.processField(field as any, fieldSchema) as unknown as FormlyFieldConfig;
        field.props!.editorConfig = editorConfig;
        field.props!.getRoot = () => this.fields()[0];

        if (fieldSchema['key'] && fieldSchema['key'] === 'identified_by_type') {
          field.props!.change = (f: FormlyFieldConfig) => {
            if (f.parent!.model.value) {
              const parentControls = (f.parent!.formControl as UntypedFormGroup).controls;
              parentControls['value'].markAsTouched();
              parentControls['value'].updateValueAndValidity();
            }
          };
        }

        if (fieldSchema['key'] && fieldSchema['key'] === 'identified_by_value') {
          field.validators = {
            identifier: {
              expression: (c: { value: string; parent: { controls: { type: { value: string } } } }) => {
                switch (c.parent.controls.type.value) {
                  case 'bf:Doi':
                    return /^10\..+\/.+$/.test(c.value);
                  case 'bf:Isbn':
                    return /^(97(8|9))?\d{9}(\d|X)$/.test(c.value);
                  case 'pmid':
                    return /^[1-3]\d{7}|[1-9]\d{0,6}$/.test(c.value);
                  case 'uri':
                    return /^https?:\/\/.+\..+$/.test(c.value);
                }
                return true;
              },
              message: (_error: unknown, _field: FormlyFieldConfig) =>
                this.translateService.instant(
                  'The format is not valid for this type of identifier.'
                ),
            },
          };
        }
        return field;
      },
    });
  }

  private getFormFields(fieldGroup: FormlyFieldConfig[], step: string): FormlyFieldConfig[] {
    const fields = fieldGroup.filter((item) => item.key === step);
    console.log(this.store.schema(), this.currentStep(), step, fields);
    return [fields[0]];
  }
}
