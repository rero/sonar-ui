// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Bind } from '@openng/optimus-ui/bind';
import { Tag } from '@openng/optimus-ui/tag';
import { DetailUrl, MarkdownPipe, RecordData, UpperCaseFirstPipe } from '@rero/ng-core';

@Component({
  templateUrl: './organisation.component.html',
  imports: [RouterLink, Bind, Tag, TranslatePipe, MarkdownPipe, UpperCaseFirstPipe],
})
export class OrganisationComponent {
  record = input.required<RecordData>();
  type = input.required<string>();
  detailUrl = input<DetailUrl>();
}
