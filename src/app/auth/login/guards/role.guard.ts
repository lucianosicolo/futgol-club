import {
  Injectable,
} from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
} from '@angular/router';


interface LoggedUser {

  id: string;

  name: string;

  last_name: string;

  email: string;

  phone: string;

  role:
    | 'admin'
    | 'teacher'
    | 'responsible';

  active: boolean;

}


@Injectable({
  providedIn: 'root',
})
export class RoleGuard
  implements CanActivate {


  constructor(
    private readonly router:
      Router,
  ) {}


  canActivate(
    route:
      ActivatedRouteSnapshot,
  ): boolean {


    const storedUser =
      localStorage.getItem(
        'futgol-user',
      );


    if (!storedUser) {

      void this.router.navigateByUrl(
        '/login',
        {
          replaceUrl: true,
        },
      );


      return false;

    }


    let user:
      LoggedUser;


    try {

      user =
        JSON.parse(
          storedUser,
        );

    } catch {

      void this.router.navigateByUrl(
        '/login',
        {
          replaceUrl: true,
        },
      );


      return false;

    }


    const allowedRoles =
      route.data[
        'roles'
      ] as string[] | undefined;


    /*
     * Si una ruta no define roles,
     * alcanza con estar logueado.
     */

    if (
      !allowedRoles ||
      allowedRoles.length === 0
    ) {

      return true;

    }


    if (
      allowedRoles.includes(
        user.role,
      )
    ) {

      return true;

    }


    /*
     * Si intenta entrar a una
     * pantalla que no corresponde,
     * lo mandamos a su home.
     */

    if (
      user.role ===
      'responsible'
    ) {

      void this.router.navigateByUrl(
        '/app/familia',
        {
          replaceUrl: true,
        },
      );

    } else {

      void this.router.navigateByUrl(
        '/app/home',
        {
          replaceUrl: true,
        },
      );

    }


    return false;

  }

}