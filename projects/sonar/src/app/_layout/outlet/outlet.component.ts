// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class OutletComponent {}
