import {
  Injectable,
} from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard
  implements CanActivate {


  constructor(
    private readonly router:
      Router,
  ) {}


  canActivate(
    route:
      ActivatedRouteSnapshot,

    state:
      RouterStateSnapshot,
  ): boolean {


    const token =
      localStorage.getItem(
        'futgol-token',
      );


    const user =
      localStorage.getItem(
        'futgol-user',
      );


    if (
      token &&
      user
    ) {

      return true;

    }


    void this.router.navigateByUrl(
      '/login',
      {
        replaceUrl: true,
      },
    );


    return false;

  }

}