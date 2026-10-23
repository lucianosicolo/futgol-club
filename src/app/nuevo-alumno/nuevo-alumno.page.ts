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
  ToastController,
} from '@ionic/angular';

import {
  firstValueFrom,
  forkJoin,
} from 'rxjs';
import { environment } from 'src/environments/environment';


type AccessMode =
  | 'none'
  | 'self'
  | 'responsible';


type ResponsibleMode =
  | 'existing'
  | 'new';


interface ApiResponse<T> {
  ok: boolean;
  result: T;
  msg: string;
}


interface Category {
  id: string;
  name: string;
  active: boolean;
}


interface Student {
  id: string;
  name: string;
  last_name: string;
  document: string;
  active: boolean;
  category?: Category;
}


interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  students?: Student[];
}


@Component({
  selector: 'app-nuevo-alumno',
  templateUrl: './nuevo-alumno.page.html',
  styleUrls: ['./nuevo-alumno.page.scss'],
  standalone: false,
})
export class NuevoAlumnoPage
  implements OnInit {


  private readonly apiUrl =
  environment.apiUrl;


  loading =
    true;


  saving =
    false;


  categories:
    Category[] =
    [];


  responsibleUsers:
    User[] =
    [];


  /* ============================= */
  /* DATOS DEL ALUMNO              */
  /* ============================= */

  name =
    '';

  lastName =
    '';

  document =
    '';

  birthDate =
    '';

  address =
    '';

  categoryId =
    '';


  /* ============================= */
  /* ACCESO MI FUTGOL              */
  /* ============================= */

  accessMode:
    AccessMode =
    'none';


  /* ============================= */
  /* CUENTA PROPIA                 */
  /* ============================= */

  accountEmail =
    '';

  accountPhone =
    '';

  accountPassword =
    '';


  /* ============================= */
  /* RESPONSABLE                   */
  /* ============================= */

  responsibleMode:
    ResponsibleMode =
    'existing';


  selectedResponsibleId =
    '';


  responsibleName =
    '';

  responsibleLastName =
    '';

  responsibleEmail =
    '';

  responsiblePhone =
    '';

  responsiblePassword =
    '';


  constructor(

    private readonly http:
      HttpClient,

    private readonly router:
      Router,

    private readonly toastController:
      ToastController,

  ) {}


  ngOnInit(): void {

    this.loadData();

  }


  /* ============================= */
  /* CARGAR DATOS                  */
  /* ============================= */

  private loadData(): void {

    this.loading =
      true;


    forkJoin({

      categories:
        this.http.get<
          ApiResponse<Category[]>
        >(
          `${this.apiUrl}/categories?active=true`,
        ),

      responsibles:
        this.http.get<
          ApiResponse<User[]>
        >(
          `${this.apiUrl}/users?role=responsible&active=true`,
        ),

    }).subscribe({

      next:
        response => {


          this.categories =
            response
              .categories
              .result ??
            [];


          this.responsibleUsers =
            response
              .responsibles
              .result ??
            [];


          this.loading =
            false;

        },


      error:
        error => {


          console.error(
            'Error cargando información:',
            error,
          );


          this.loading =
            false;


          void this.showToast(
            'No se pudo cargar la información.',
            'danger',
          );

        },

    });

  }


  /* ============================= */
  /* RESPONSABLE SELECCIONADO      */
  /* ============================= */

  get selectedResponsible():
    User | null {


    if (
      !this.selectedResponsibleId
    ) {

      return null;

    }


    return (
      this.responsibleUsers
        .find(
          user =>
            user.id ===
            this.selectedResponsibleId,
        ) ??
      null
    );

  }


  /* ============================= */
  /* GUARDAR                       */
  /* ============================= */

  async save(): Promise<void> {


    /*
     * Validación básica
     * del alumno.
     */

    if (
      !this.name.trim() ||
      !this.lastName.trim() ||
      !this.document.trim() ||
      !this.birthDate ||
      !this.categoryId
    ) {

      await this.showToast(
        'Completá los datos obligatorios del alumno.',
        'danger',
      );

      return;

    }


    /*
     * Si el alumno tendrá
     * cuenta propia.
     */

    if (
      this.accessMode ===
      'self'
    ) {

      if (
        !this.accountEmail.trim() ||
        !this.accountPhone.trim() ||
        !this.accountPassword
      ) {

        await this.showToast(
          'Completá los datos del acceso Mi FUTGOL.',
          'danger',
        );

        return;

      }

    }


    /*
     * Si tendrá responsable.
     */

    if (
      this.accessMode ===
      'responsible'
    ) {


      /*
       * Responsable existente.
       */

      if (
        this.responsibleMode ===
        'existing' &&
        !this.selectedResponsibleId
      ) {

        await this.showToast(
          'Seleccioná un responsable.',
          'danger',
        );

        return;

      }


      /*
       * Responsable nuevo.
       */

      if (
        this.responsibleMode ===
        'new'
      ) {

        if (
          !this.responsibleName.trim() ||
          !this.responsibleLastName.trim() ||
          !this.responsibleEmail.trim() ||
          !this.responsiblePhone.trim() ||
          !this.responsiblePassword
        ) {

          await this.showToast(
            'Completá los datos del responsable.',
            'danger',
          );

          return;

        }

      }

    }


    this.saving =
      true;


    try {


      const payload:
        any = {

        student: {

          name:
            this.name.trim(),

          last_name:
            this.lastName.trim(),

          document:
            this.document.trim(),

          birth_date:
            this.birthDate,

          address:
            this.address.trim(),

          category_id:
            this.categoryId,

        },

        access_mode:
          this.accessMode,

      };


      if (
        this.accessMode ===
        'self'
      ) {

        payload.self_account = {

          email:
            this.accountEmail
              .trim()
              .toLowerCase(),

          phone:
            this.accountPhone.trim(),

          password:
            this.accountPassword,

        };

      }


      if (
        this.accessMode ===
        'responsible'
      ) {

        payload.responsible_mode =
          this.responsibleMode;


        if (
          this.responsibleMode ===
          'existing'
        ) {

          payload.responsible_user_id =
            this.selectedResponsibleId;

        } else {

          payload.responsible_account = {

            name:
              this.responsibleName.trim(),

            last_name:
              this.responsibleLastName.trim(),

            email:
              this.responsibleEmail
                .trim()
                .toLowerCase(),

            phone:
              this.responsiblePhone.trim(),

            password:
              this.responsiblePassword,

          };

        }

      }


      await firstValueFrom(

        this.http.post(
          `${this.apiUrl}/registrations/student`,
          payload,
        ),

      );


      await this.showToast(
        'Alumno creado correctamente.',
        'success',
      );


      await this.router.navigateByUrl(
        '/app/alumnos',
        {
          replaceUrl:
            true,
        },
      );


    } catch (error: any) {


      console.error(
        'Error creando alumno:',
        error,
      );


      await this.showToast(
        this.getErrorMessage(
          error,
        ),
        'danger',
      );


    } finally {

      this.saving =
        false;

    }

  }


  /* ============================= */
  /* ERROR                         */
  /* ============================= */

  private getErrorMessage(
    error: any,
  ): string {


    if (
      error?.message ===
      'Responsible not found'
    ) {

      return 'No se encontró el responsable seleccionado.';

    }


    const message =
      error?.error?.message ??
      error?.error?.error ??
      error?.error;


    if (
      Array.isArray(
        message,
      )
    ) {

      return message.join(
        ', ',
      );

    }


    if (
      typeof message ===
      'string'
    ) {

      return message;

    }


    return 'No se pudo crear el alumno.';

  }


  /* ============================= */
  /* TOAST                         */
  /* ============================= */

  private async showToast(

    message: string,

    color:
      'success' |
      'danger',

  ): Promise<void> {


    const toast =
      await this.toastController
        .create({

          message,

          duration:
            2300,

          position:
            'bottom',

          color,

        });


    await toast.present();

  }

}