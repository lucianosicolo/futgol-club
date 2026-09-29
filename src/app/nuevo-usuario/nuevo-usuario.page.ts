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
  forkJoin,
} from 'rxjs';


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
    'http://localhost:3000';


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


    /*
     * Personas a cargo.
     */

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


    this.http
      .post<
        ApiResponse<CreatedUser>
      >(
        `${this.apiUrl}/users`,
        userPayload,
      )
      .subscribe({

        next:
          response => {


            const createdUser =
              response.result;


            /*
             * Si NO entrena,
             * terminamos acá.
             */

            if (!this.isStudent) {

              void this.finishSuccess();

              return;

            }


            /*
             * Si también entrena,
             * creamos Student
             * relacionado al User.
             */

            this.createStudent(
              createdUser.id,
            );

          },


        error:
          error => {


            console.error(
              'Error creando usuario:',
              error,
            );


            this.saving =
              false;


            void this.showToast(
              this.getErrorMessage(
                error,
              ),
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* CREAR STUDENT                 */
  /* ============================= */

  private createStudent(
    userId: string,
  ): void {


    const studentPayload =
      {

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

        avatar:
          '',

        category: {
          id:
            this.categoryId,
        },

        user_id:
          userId,

      };


    this.http
      .post<
        ApiResponse<Student>
      >(
        `${this.apiUrl}/students`,
        studentPayload,
      )
      .subscribe({

        next:
          () => {

            void this.finishSuccess();

          },


        error:
          error => {


            console.error(
              'Usuario creado pero error creando alumno:',
              error,
            );


            this.saving =
              false;


            void this.showToast(
              'La cuenta fue creada, pero no se pudo crear su ficha de alumno.',
              'danger',
            );

          },

      });

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