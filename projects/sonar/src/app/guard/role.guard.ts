import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
/** This guard check if the current logged user has a specific role. The role to check should be passed
 *  using path.data.role (see below).
 *
 *  USAGE:
 *  { path: 'new',
 *    component: MyComponent,
 *    canActivate: [RoleGuard],
 *    data: {
 *      role: 'xxx'
 *    }
 *  }
 */
export class RoleGuard implements CanActivate {

  constructor(
    private _userService: UserService
  ) { }

  /** Check if the current logged user as at least a specific role */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this._userService.user$.pipe(
      filter(user => user !== null), // Because we don't take care of first null value for taking the decision.
      map((user: any) => {
        if (user === null) {
          return true;
        }

        return this._userService.is(next.data.role || 'user');
      })
    );
  }

}
