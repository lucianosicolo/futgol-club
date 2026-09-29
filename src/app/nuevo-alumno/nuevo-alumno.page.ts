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
    'http://localhost:3000';


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


      /* ============================= */
      /* CASO 1                        */
      /* SOLO ALUMNO                   */
      /* ============================= */

      if (
        this.accessMode ===
        'none'
      ) {

        await this.createStudent();

      }


      /* ============================= */
      /* CASO 2                        */
      /* ALUMNO CON CUENTA PROPIA      */
      /* ============================= */

      if (
        this.accessMode ===
        'self'
      ) {

        /*
         * Primero creamos
         * el usuario.
         */

        const user =
          await this.createSelfUser();


        /*
         * Después creamos
         * el Student vinculado
         * mediante user_id.
         */

        await this.createStudent(
          user.id,
        );

      }


      /* ============================= */
      /* CASO 3                        */
      /* RESPONSABLE                   */
      /* ============================= */

      if (
        this.accessMode ===
        'responsible'
      ) {

        /*
         * Primero creamos
         * al alumno.
         */

        const student =
          await this.createStudent();


        /*
         * Responsable existente.
         */

        if (
          this.responsibleMode ===
          'existing'
        ) {

          await this.addStudentToExistingResponsible(
            student.id,
          );

        }


        /*
         * Responsable nuevo.
         */

        if (
          this.responsibleMode ===
          'new'
        ) {

          await this.createResponsible(
            student.id,
          );

        }

      }


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
  /* CREAR ALUMNO                  */
  /* ============================= */

  private async createStudent(
    userId?: string,
  ): Promise<Student> {


    const payload:
      any = {

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

      };


    /*
     * Si el alumno usa
     * su propia cuenta.
     */

    if (userId) {

      payload.user_id =
        userId;

    }


    const response =
      await firstValueFrom(

        this.http.post<
          ApiResponse<Student>
        >(
          `${this.apiUrl}/students`,
          payload,
        ),

      );


    return response.result;

  }


  /* ============================= */
  /* CREAR CUENTA PROPIA           */
  /* ============================= */

  private async createSelfUser():
    Promise<User> {


    const payload =
      {

        name:
          this.name.trim(),

        last_name:
          this.lastName.trim(),

        email:
          this.accountEmail
            .trim()
            .toLowerCase(),

        phone:
          this.accountPhone.trim(),

        password:
          this.accountPassword,

        role:
          'responsible',

      };


    const response =
      await firstValueFrom(

        this.http.post<
          ApiResponse<User>
        >(
          `${this.apiUrl}/users`,
          payload,
        ),

      );


    return response.result;

  }


  /* ============================= */
  /* CREAR RESPONSABLE NUEVO       */
  /* ============================= */

  private async createResponsible(
    studentId: string,
  ): Promise<User> {


    const payload =
      {

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

        role:
          'responsible',

        students: [

          {
            id:
              studentId,
          },

        ],

      };


    const response =
      await firstValueFrom(

        this.http.post<
          ApiResponse<User>
        >(
          `${this.apiUrl}/users`,
          payload,
        ),

      );


    return response.result;

  }


  /* ============================= */
  /* ASOCIAR RESPONSABLE EXISTENTE */
  /* ============================= */

  private async addStudentToExistingResponsible(
    studentId: string,
  ): Promise<void> {


    const responsible =
      this.selectedResponsible;


    if (!responsible) {

      throw new Error(
        'Responsible not found',
      );

    }


    /*
     * Hijos que ya tenía
     * el responsable.
     */

    const currentStudentIds =
      (
        responsible.students ??
        []
      )
        .map(
          student =>
            student.id,
        );


    /*
     * Conservamos los existentes
     * y agregamos el nuevo.
     */

    const finalStudentIds =
      [
        ...new Set([
          ...currentStudentIds,
          studentId,
        ]),
      ];


    const payload =
      {

        students:
          finalStudentIds.map(
            id => ({
              id,
            }),
          ),

      };


    await firstValueFrom(

      this.http.put(
        `${this.apiUrl}/users/${responsible.id}`,
        payload,
      ),

    );

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