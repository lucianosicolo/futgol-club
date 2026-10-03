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


    const redirectByRole =
      route.data[
        'redirectByRole'
      ] as boolean | undefined;


    /* ============================= */
    /* REDIRECT SEGÚN ROL            */
    /* ============================= */

    if (
      redirectByRole
    ) {

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


    /* ============================= */
    /* RUTA SIN ROLES DEFINIDOS      */
    /* ============================= */

    if (
      !allowedRoles ||
      allowedRoles.length === 0
    ) {

      return true;

    }


    /* ============================= */
    /* ROL PERMITIDO                 */
    /* ============================= */

    if (
      allowedRoles.includes(
        user.role,
      )
    ) {

      return true;

    }


    /* ============================= */
    /* ROL NO PERMITIDO              */
    /* ============================= */

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