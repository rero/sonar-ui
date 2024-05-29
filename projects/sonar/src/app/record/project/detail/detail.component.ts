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
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../user.service';

@Component({
    templateUrl: './detail.component.html',
    standalone: false
})
export class DetailComponent implements OnInit {

  private userService: UserService = inject(UserService);

  /** Observable resolving record data */
  record$: Observable<any>;

  /** Resolve logged user */
  user$: Observable<any>;

  /** Type of resource. */
  type: string;

  ngOnInit(): void {
      this.user$ = this.userService.user$;
  }
}
