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
  category: Category;
}


interface CreatedUser {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}


@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.page.html',
  styleUrls: ['./nuevo-usuario.page.scss'],
  standalone: false,
})
export class NuevoUsuarioPage
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


  students:
    Student[] =
    [];


  /* ============================= */
  /* USUARIO                       */
  /* ============================= */

  name =
    '';

  lastName =
    '';

  email =
    '';

  phone =
    '';

  password =
    '';


  /* ============================= */
  /* ALUMNO PROPIO                 */
  /* ============================= */

  isStudent =
    false;


  document =
    '';

  birthDate =
    '';

  address =
    '';

  categoryId =
    '';


  /* ============================= */
  /* PERSONAS A CARGO              */
  /* ============================= */

  hasDependents =
    false;


  dependentStudentIds:
    string[] =
    [];


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

  loadData(): void {

    this.loading =
      true;


    forkJoin({

      categories:
        this.http.get<
          ApiResponse<Category[]>
        >(
          `${this.apiUrl}/categories?active=true`,
        ),

      students:
        this.http.get<
          ApiResponse<Student[]>
        >(
          `${this.apiUrl}/students?active=true`,
        ),

    }).subscribe({

      next:
        response => {


          this.categories =
            response.categories.result ??
            [];


          this.students =
            response.students.result ??
            [];


          this.loading =
            false;

        },


      error:
        error => {


          console.error(
            'Error cargando datos:',
            error,
          );


          this.loading =
            false;


          void this.showToast(
            'No se pudieron cargar los datos.',
            'danger',
          );

        },

    });

  }


  /* ============================= */
  /* TOGGLES                       */
  /* ============================= */

  onStudentToggle(): void {

    if (!this.isStudent) {

      this.document =
        '';

      this.birthDate =
        '';

      this.address =
        '';

      this.categoryId =
        '';

    }

  }


  onDependentsToggle(): void {

    if (!this.hasDependents) {

      this.dependentStudentIds =
        [];

    }

  }


  /* ============================= */
  /* GUARDAR                       */
  /* ============================= */

  async save(): Promise<void> {


    if (
      !this.name.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.phone.trim() ||
      !this.password
    ) {

      await this.showToast(
        'Completá los datos obligatorios.',
        'danger',
      );

      return;

    }


    if (
      this.isStudent &&
      (
        !this.document.trim() ||
        !this.birthDate ||
        !this.categoryId
      )
    ) {

      await this.showToast(
        'Completá los datos del alumno.',
        'danger',
      );

      return;

    }


    this.saving =
      true;


    try {


      /*
       * Si también entrena, usuario +
       * alumno + personas a cargo se crean
       * dentro de una única transacción.
       */
      if (
        this.isStudent
      ) {

        const registrationPayload:
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
            'self',

          self_account: {

            email:
              this.email
                .trim()
                .toLowerCase(),

            phone:
              this.phone.trim(),

            password:
              this.password,

          },

          dependent_student_ids:
            this.hasDependents
              ? this.dependentStudentIds
              : [],

        };


        await firstValueFrom(

          this.http.post(
            `${this.apiUrl}/registrations/student`,
            registrationPayload,
          ),

        );


        await this.finishSuccess();

        return;

      }


      /*
       * Si no entrena, el alta es un único
       * usuario y no necesita orquestación.
       */
      const userPayload:
        any = {

        name:
          this.name.trim(),

        last_name:
          this.lastName.trim(),

        email:
          this.email
            .trim()
            .toLowerCase(),

        phone:
          this.phone.trim(),

        password:
          this.password,

        role:
          'responsible',

      };


      if (
        this.hasDependents
      ) {

        userPayload.students =
          this.dependentStudentIds
            .map(
              id => ({
                id,
              }),
            );

      }


      await firstValueFrom(

        this.http.post<
          ApiResponse<CreatedUser>
        >(
          `${this.apiUrl}/users`,
          userPayload,
        ),

      );


      await this.finishSuccess();


    } catch (error: any) {


      console.error(
        'Error creando usuario:',
        error,
      );


      this.saving =
        false;


      await this.showToast(
        this.getErrorMessage(
          error,
        ),
        'danger',
      );

    }

  }


  /* ============================= */
  /* ÉXITO                         */
  /* ============================= */

  private async finishSuccess():
    Promise<void> {


    this.saving =
      false;


    await this.showToast(
      'Usuario creado correctamente.',
      'success',
    );


    await this.router.navigateByUrl(
      '/app/home',
      {
        replaceUrl:
          true,
      },
    );

  }


  /* ============================= */
  /* ERRORES                       */
  /* ============================= */

  private getErrorMessage(
    error: any,
  ): string {


    const message =
      error?.error?.message ??
      error?.error ??
      'No se pudo crear el usuario.';


    if (
      typeof message ===
      'string'
    ) {

      return message;

    }


    return 'No se pudo crear el usuario.';

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