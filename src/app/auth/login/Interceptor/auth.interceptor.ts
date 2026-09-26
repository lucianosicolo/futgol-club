import {
  Injectable,
} from '@angular/core';

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';


@Injectable()
export class AuthInterceptor
  implements HttpInterceptor {


  intercept(

    req: HttpRequest<any>,

    next: HttpHandler,

  ): Observable<HttpEvent<any>> {


    const token =
      localStorage.getItem(
        'futgol-token',
      );


    /*
     * Solo agregamos el token
     * a nuestro backend.
     */

    const isBackendRequest =
      req.url.startsWith(
        'http://localhost:3000',
      );


    if (
      token &&
      isBackendRequest
    ) {


      const authenticatedRequest =
        req.clone({

          setHeaders: {

            Authorization:
              `Bearer ${token}`,

          },

        });


      return next.handle(
        authenticatedRequest,
      );

    }


    return next.handle(
      req,
    );

  }

}