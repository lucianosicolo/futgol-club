import {
  Component,
  OnInit,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  ToastController,
} from '@ionic/angular';


type StudentTab =
  | 'info'
  | 'payments'
  | 'attendance';


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


interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}


interface StudentDetail {
  id: string;

  name: string;
  last_name: string;

  document: string;

  birth_date: string;

  address: string;

  avatar: string;

  active: boolean;

  category: Category;

  user?: User | null;

  responsibles?: User[];
}


@Component({
  selector: 'app-alumno-detalle',
  templateUrl: './alumno-detalle.page.html',
  styleUrls: ['./alumno-detalle.page.scss'],
  standalone: false,
})
export class AlumnoDetallePage
  implements OnInit {


  private readonly apiUrl =
    'http://localhost:3000';


  selectedTab:
    StudentTab =
    'info';


  loading =
    true;


  student:
    StudentDetail | null =
    null;


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly http:
      HttpClient,

    private readonly toastController:
      ToastController,

  ) {}
isEditing =
  false;


savingEdit =
  false;


categories:
  Category[] =
  [];


editStudent = {

  name:
    '',

  last_name:
    '',

  document:
    '',

  birth_date:
    '',

  address:
    '',

  categoryId:
    '',

};

ngOnInit(): void {


  const studentId =
    this.route.snapshot
      .paramMap
      .get('id');


  if (!studentId) {

    void this.router.navigateByUrl(
      '/app/alumnos',
    );

    return;

  }


  this.loadCategories();


  this.loadStudent(
    studentId,
  );

}

private loadCategories(): void {


  this.http
    .get<
      ApiResponse<Category[]>
    >(
      `${this.apiUrl}/categories?active=true`,
    )
    .subscribe({

      next:
        response => {

          this.categories =
            response.result ??
            [];

        },


      error:
        error => {

          console.error(
            'Error cargando categorías:',
            error,
          );

        },

    });

}
/* ============================= */
/* EDITAR ALUMNO                 */
/* ============================= */

startEditing(): void {


  if (!this.student) {
    return;
  }


  this.editStudent =
    {

      name:
        this.student.name,

      last_name:
        this.student.last_name,

      document:
        this.student.document,

      birth_date:
        String(
          this.student.birth_date,
        )
          .slice(
            0,
            10,
          ),

      address:
        this.student.address ??
        '',

      categoryId:
        this.student.category?.id ??
        '',

    };


  this.isEditing =
    true;

}


cancelEditing(): void {


  this.isEditing =
    false;


  this.editStudent =
    {

      name:
        '',

      last_name:
        '',

      document:
        '',

      birth_date:
        '',

      address:
        '',

      categoryId:
        '',

    };

}
async saveChanges():
  Promise<void> {


  if (!this.student) {
    return;
  }


  if (
    !this.editStudent.name.trim() ||
    !this.editStudent.last_name.trim() ||
    !this.editStudent.document.trim() ||
    !this.editStudent.birth_date ||
    !this.editStudent.categoryId
  ) {

    await this.showToast(
      'Completá los campos obligatorios.',
      'danger',
    );

    return;

  }


  this.savingEdit =
    true;


  const payload =
    {

      name:
        this.editStudent.name.trim(),

      last_name:
        this.editStudent.last_name.trim(),

      document:
        this.editStudent.document.trim(),

      birth_date:
        this.editStudent.birth_date,

      address:
        this.editStudent.address.trim(),

      category: {

        id:
          this.editStudent.categoryId,

      },

    };


  this.http
    .put<
      ApiResponse<StudentDetail>
    >(
      `${this.apiUrl}/students/${this.student.id}`,
      payload,
    )
    .subscribe({

      next:
        response => {


          this.student =
            response.result;


          this.isEditing =
            false;


          this.savingEdit =
            false;


          void this.showToast(
            'Alumno actualizado correctamente.',
            'success',
          );

        },


      error:
        error => {


          console.error(
            'Error actualizando alumno:',
            error,
          );


          this.savingEdit =
            false;


          const message =
            error?.error?.message;


          void this.showToast(

            typeof message ===
              'string'

              ? message

              : 'No se pudo actualizar el alumno.',

            'danger',

          );

        },

    });

}
  /* ============================= */
  /* CARGAR ALUMNO                 */
  /* ============================= */

  private loadStudent(
    studentId: string,
  ): void {


    this.loading =
      true;


    this.http
      .get<
        ApiResponse<StudentDetail>
      >(
        `${this.apiUrl}/students/${studentId}`,
      )
      .subscribe({

        next:
          response => {


            this.student =
              response.result;


            this.loading =
              false;

          },


        error:
          error => {


            console.error(
              'Error cargando alumno:',
              error,
            );


            this.loading =
              false;


            void this.showToast(
              'No se pudo cargar el alumno.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* TABS                          */
  /* ============================= */

  selectTab(
    tab: StudentTab,
  ): void {

    this.selectedTab =
      tab;

  }


  /* ============================= */
  /* FECHA                         */
  /* ============================= */

  get formattedBirthDate():
    string {


    if (
      !this.student?.birth_date
    ) {

      return 'Sin informar';

    }


    const value =
      String(
        this.student.birth_date,
      )
        .slice(
          0,
          10,
        );


    const parts =
      value.split(
        '-',
      );


    if (
      parts.length !==
      3
    ) {

      return value;

    }


    const [
      year,
      month,
      day,
    ] =
      parts;


    return (
      `${day}/${month}/${year}`
    );

  }


  /* ============================= */
  /* EDAD                          */
  /* ============================= */

  get age():
    number | null {


    if (
      !this.student?.birth_date
    ) {

      return null;

    }


    const parts =
      String(
        this.student.birth_date,
      )
        .slice(
          0,
          10,
        )
        .split(
          '-',
        );


    if (
      parts.length !==
      3
    ) {

      return null;

    }


    const year =
      Number(
        parts[0],
      );

    const month =
      Number(
        parts[1],
      );

    const day =
      Number(
        parts[2],
      );


    const today =
      new Date();


    let age =
      today.getFullYear() -
      year;


    const birthdayPassed =
      (
        today.getMonth() + 1 >
        month
      ) ||
      (
        today.getMonth() + 1 ===
          month &&
        today.getDate() >=
          day
      );


    if (!birthdayPassed) {

      age--;

    }


    return age;

  }


  /* ============================= */
  /* ACCESO MI FUTGOL              */
  /* ============================= */

  get hasOwnAccount():
    boolean {

    return !!this.student?.user;

  }


  get responsibles():
    User[] {

    return (
      this.student
        ?.responsibles ??
      []
    );

  }


  get hasResponsibles():
    boolean {

    return (
      this.responsibles.length >
      0
    );

  }


  get hasAnyAccess():
    boolean {

    return (
      this.hasOwnAccount ||
      this.hasResponsibles
    );

  }


  /* ============================= */
  /* WHATSAPP                      */
  /* ============================= */

  sendWhatsApp(
    user: User,
  ): void {


    const phone =
      user.phone
        ?.replace(
          /\D/g,
          '',
        );


    if (!phone) {

      void this.showToast(
        'Este usuario no tiene un teléfono cargado.',
        'danger',
      );

      return;

    }


    /*
     * Si ya viene con 54,
     * no lo duplicamos.
     */

    const finalPhone =
      phone.startsWith(
        '54',
      )
        ? phone
        : `54${phone}`;


    window.open(
      `https://wa.me/${finalPhone}`,
      '_blank',
    );

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
            2200,

          position:
            'bottom',

          color,

        });


    await toast.present();

  }

}