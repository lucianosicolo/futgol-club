import {
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';

import {
  Observable,
  catchError,
  map,
  of,
} from 'rxjs';

import {
  environment,
} from 'src/environments/environment';


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


  private readonly apiUrl =
    environment.apiUrl;


  constructor(
    private readonly router:
      Router,

    private readonly http:
      HttpClient,
  ) {}


  canActivate(
    route:
      ActivatedRouteSnapshot,
  ):
    Observable<
      boolean |
      UrlTree
    > {


    const token =
      localStorage.getItem(
        'futgol-token',
      );


    const storedUser =
      localStorage.getItem(
        'futgol-user',
      );


    if (
      !token ||
      !storedUser
    ) {

      return of(
        this.router.parseUrl(
          '/login',
        ),
      );

    }


    let localUser:
      LoggedUser;


    try {

      localUser =
        JSON.parse(
          storedUser,
        );

    } catch {

      return of(
        this.router.parseUrl(
          '/login',
        ),
      );

    }


    return this.http
      .get<{
        ok: boolean;
        result: {
          id: string;
          email: string;
          role: LoggedUser['role'];
        };
        msg: string;
      }>(
        `${this.apiUrl}/auth/me`,
      )
      .pipe(

        map(
          response => {

            const user:
              LoggedUser = {

                ...localUser,

                id:
                  response.result.id,

                email:
                  response.result.email,

                role:
                  response.result.role,

                active:
                  true,

              };


            localStorage.setItem(
              'futgol-user',
              JSON.stringify(
                user,
              ),
            );


            const allowedRoles =
              route.data[
                'roles'
              ] as string[] | undefined;


            const redirectByRole =
              route.data[
                'redirectByRole'
              ] as boolean | undefined;


            if (
              redirectByRole
            ) {

              return this.router.parseUrl(

                user.role ===
                  'responsible'
                  ? '/app/familia'
                  : '/app/home',

              );

            }


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


            return this.router.parseUrl(

              user.role ===
                'responsible'
                ? '/app/familia'
                : '/app/home',

            );

          },
        ),

        catchError(
          () =>
            of(
              this.router.parseUrl(
                '/login',
              ),
            ),
        ),

      );

  }

}