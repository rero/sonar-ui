// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetailUrl, MarkdownPipe, UpperCaseFirstPipe, RecordData } from '@rero/ng-core';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './organisation.component.html',
    imports: [RouterLink, Bind, Tag, TranslatePipe, MarkdownPipe, UpperCaseFirstPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganisationComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();
}
