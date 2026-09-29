import {
  Component,
  OnInit,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Router,
} from '@angular/router';

import {
  AlertController,
} from '@ionic/angular';


interface Category {
  id: string;
  name: string;
}


interface Student {
  id: string;
  name: string;
  last_name: string;
  avatar: string | null;
  category?: Category;
}


interface MyStudentsResult {

  self:
    Student | null;

  dependents:
    Student[];

}


interface ApiResponse<T> {

  ok: boolean;

  result: T;

  msg: string;

}


interface LoggedUser {

  id: string;

  name: string;

  last_name: string;

  email: string;

  phone: string;

  role: string;

  active: boolean;

}


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage
  implements OnInit {


  private readonly apiUrl =
    'http://localhost:3000';


  user:
    LoggedUser | null =
    null;


  self:
    Student | null =
    null;


  dependents:
    Student[] =
    [];


  loading =
    true;


  constructor(

    private readonly http:
      HttpClient,

    private readonly router:
      Router,

    private readonly alertController:
      AlertController,

  ) {}


  ngOnInit(): void {

    this.loadProfile();

  }


  ionViewWillEnter(): void {

    this.loadProfile();

  }


  /* ============================= */
  /* PERFIL                       */
  /* ============================= */

  private loadProfile(): void {


    const storedUser =
      localStorage.getItem(
        'futgol-user',
      );


    if (!storedUser) {

      this.loading =
        false;

      return;

    }


    try {

      this.user =
        JSON.parse(
          storedUser,
        );

    } catch {

      this.user =
        null;

      this.loading =
        false;

      return;

    }


    /*
     * Solo buscamos actividad propia
     * y personas asociadas si es
     * usuario de Mi FUTGOL.
     */

    if (
      this.user?.role !==
      'responsible'
    ) {

      this.loading =
        false;

      return;

    }


    this.loading =
      true;


    this.http
      .get<
        ApiResponse<MyStudentsResult>
      >(
        `${this.apiUrl}/students/my`,
      )
      .subscribe({

        next:
          response => {


            this.self =
              response
                .result
                .self;


            this.dependents =
              response
                .result
                .dependents ??
              [];


            this.loading =
              false;

          },


        error:
          error => {

            console.error(
              'Error cargando perfil:',
              error,
            );


            this.loading =
              false;

          },

      });

  }


  /* ============================= */
  /* TIPO DE CUENTA               */
  /* ============================= */

  get roleLabel():
    string {


    switch (
      this.user?.role
    ) {

      case 'admin':
        return 'Administrador';

      case 'teacher':
        return 'Profesor';

      case 'responsible':
        return 'Miembro';

      default:
        return 'Usuario';

    }

  }


  /* ============================= */
  /* INICIALES                    */
  /* ============================= */

  get initials():
    string {


    if (!this.user) {

      return '';

    }


    const first =
      this.user.name?.charAt(0) ?? '';

    const last =
      this.user.last_name?.charAt(0) ?? '';


    return (
      first +
      last
    ).toUpperCase();

  }


  /* ============================= */
  /* LOGOUT                       */
  /* ============================= */

  async logout(): Promise<void> {


    const alert =
      await this.alertController
        .create({

          header:
            'Cerrar sesión',

          message:
            '¿Querés cerrar tu sesión de FUTGOL CLUB?',

          buttons: [

            {
              text:
                'Cancelar',

              role:
                'cancel',
            },

            {
              text:
                'Cerrar sesión',

              role:
                'confirm',

              handler:
                () => {

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

                },

            },

          ],

        });


    await alert.present();

  }

}