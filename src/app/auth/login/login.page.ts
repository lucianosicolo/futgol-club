import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';

import {
  Component,
  OnInit,
} from '@angular/core';

import {
  Router,
} from '@angular/router';

import {
  ToastController,
} from '@ionic/angular';

import {
  firstValueFrom,
} from 'rxjs';


interface AuthUser {

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


interface AuthResponse {

  ok: boolean;

  result: {

    access_token: string;

    user: AuthUser;

  };

  msg: string;

}


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {


  private readonly apiUrl =
    'http://localhost:3000';


  email =
    '';

  password =
    '';

  rememberMe =
    false;


  showPassword =
    false;

  formSubmitted =
    false;

  loading =
    false;


  constructor(

    private readonly router:
      Router,

    private readonly toastController:
      ToastController,

    private readonly http:
      HttpClient,

  ) { }


  /* ============================= */
  /* INIT                          */
  /* ============================= */

  ngOnInit(): void {


    const savedEmail =
      localStorage.getItem(
        'futgol-email',
      );


    if (savedEmail) {

      this.email =
        savedEmail;

      this.rememberMe =
        true;

    }

  }


  /* ============================= */
  /* MOSTRAR CONTRASEÑA            */
  /* ============================= */

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  /* ============================= */
  /* LOGIN                         */
  /* ============================= */

  async login(): Promise<void> {


    this.formSubmitted =
      true;


    /* ============================= */
    /* VALIDACIÓN FRONT              */
    /* ============================= */

    if (
      !this.email ||
      !this.password ||
      this.password.length < 6
    ) {

      await this.showToast(

        'Completá correctamente el correo y la contraseña.',

        'danger',

      );


      return;

    }


    if (this.loading) {

      return;

    }


    this.loading =
      true;


    try {


      /* ============================= */
      /* LOGIN BACKEND                 */
      /* ============================= */

      const response =
        await firstValueFrom(

          this.http.post<AuthResponse>(

            `${this.apiUrl}/auth/login`,

            {

              email:
                this.email
                  .trim()
                  .toLowerCase(),

              password:
                this.password,

            },

          ),

        );


      /* ============================= */
      /* VALIDAR RESPUESTA             */
      /* ============================= */

      if (
        !response.result?.access_token ||
        !response.result?.user
      ) {

        throw new Error(
          'Respuesta de login inválida',
        );

      }


      /* ============================= */
      /* RECORDAR EMAIL                */
      /* ============================= */

      if (this.rememberMe) {

        localStorage.setItem(

          'futgol-email',

          this.email
            .trim()
            .toLowerCase(),

        );

      } else {

        localStorage.removeItem(
          'futgol-email',
        );

      }


      /* ============================= */
      /* GUARDAR SESIÓN                */
      /* ============================= */

      localStorage.setItem(

        'futgol-token',

        response.result.access_token,

      );


      localStorage.setItem(

        'futgol-user',

        JSON.stringify(
          response.result.user,
        ),

      );


      /*
       * Lo mantenemos por ahora
       * porque tu app anterior usaba
       * futgol-session.
       *
       * Después lo eliminamos cuando
       * hagamos el AuthGuard real.
       */

      localStorage.setItem(
        'futgol-session',
        'true',
      );




      /* ============================= */
      /* REDIRECCIÓN                   */
      /* ============================= */
      const destination =
        response.result.user.role ===
          'responsible'
          ? '/app/familia'
          : '/app/home';


      await this.router.navigateByUrl(
        destination,
        {
          replaceUrl: true,
        },
      );


    } catch (error) {


      console.error(
        'Error login:',
        error,
      );


      if (
        error instanceof
        HttpErrorResponse
      ) {


        if (
          error.status === 401
        ) {

          await this.showToast(

            'Correo o contraseña incorrectos.',

            'danger',

          );


          return;

        }


        if (
          error.status === 0
        ) {

          await this.showToast(

            'No se pudo conectar con el servidor.',

            'danger',

          );


          return;

        }

      }


      await this.showToast(

        'No se pudo iniciar sesión.',

        'danger',

      );


    } finally {

      this.loading =
        false;

    }

  }


  /* ============================= */
  /* OLVIDÉ CONTRASEÑA             */
  /* ============================= */

  async forgotPassword():
    Promise<void> {


    await this.showToast(

      'La recuperación de contraseña estará disponible próximamente.',

      'medium',

    );

  }


  /* ============================= */
  /* TOAST                         */
  /* ============================= */

  private async showToast(

    message:
      string,

    color:
      string,

  ): Promise<void> {


    const toast =
      await this.toastController.create({

        message,

        duration:
          2200,

        position:
          'bottom',

        color,

      });


    await toast.present();

  }

}