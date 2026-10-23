import {
  Injectable,
} from '@angular/core';

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import {
  Router,
} from '@angular/router';

import {
  Observable,
  catchError,
  throwError,
} from 'rxjs';

import {
  environment,
} from 'src/environments/environment';


@Injectable()
export class AuthInterceptor
  implements HttpInterceptor {


  constructor(
    private readonly router:
      Router,
  ) {}


  intercept(

    req:
      HttpRequest<any>,

    next:
      HttpHandler,

  ): Observable<HttpEvent<any>> {


    const token =
      localStorage.getItem(
        'futgol-token',
      );


    const isBackendRequest =
      req.url.startsWith(
        environment.apiUrl,
      );


    const request =
      token &&
      isBackendRequest

        ? req.clone({

            setHeaders: {

              Authorization:
                `Bearer ${token}`,

            },

          })

        : req;


    return next
      .handle(
        request,
      )
      .pipe(

        catchError(
          (
            error:
              HttpErrorResponse,
          ) => {

            /*
             * Si el backend rechaza la sesión,
             * limpiamos el estado local para
             * evitar una app "medio logueada".
             */
            if (
              isBackendRequest &&
              error.status === 401
            ) {

              localStorage
                .removeItem(
                  'futgol-token',
                );

              localStorage
                .removeItem(
                  'futgol-user',
                );

              localStorage
                .removeItem(
                  'futgol-session',
                );


              void this.router
                .navigateByUrl(
                  '/login',
                  {
                    replaceUrl:
                      true,
                  },
                );

            }


            return throwError(
              () =>
                error,
            );

          },
        ),

      );

  }

}
