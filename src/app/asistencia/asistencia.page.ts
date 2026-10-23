import {
  HttpClient,
} from '@angular/common/http';

import {
  Component,
  OnInit,
} from '@angular/core';

import {
  ToastController,
} from '@ionic/angular';

import {
  environment,
} from 'src/environments/environment';


interface ApiResponse<T> {
  ok:
    boolean;

  result:
    T;

  msg:
    string;
}


interface CategoryApi {
  id:
    string;

  name:
    string;

  active:
    boolean;
}


interface StudentApi {

  id:
    string;

  name:
    string;

  last_name:
    string;

  document:
    string;

  birth_date:
    string;

  address:
    string;

  avatar:
    string | null;

  active:
    boolean;

  category?:
    CategoryApi | null;

}


interface AsistenciaApi {

  id:
    string;

  date:
    string;

  present:
    boolean;

  student: {

    id:
      string;

    name:
      string;

    last_name:
      string;

  };

  created_at?:
    string;

  updated_at?:
    string;

}


type AsistenciaStatus =
  | 'pending'
  | 'present'
  | 'absent';


interface AsistenciaStudent {

  id:
    string;

  name:
    string;

  lastname:
    string;

  course:
    string;

  avatar:
    string;

  status:
    AsistenciaStatus;

  /*
   * Permite distinguir un día todavía
   * no guardado de una ausencia real
   * recuperada desde la base.
   */
  saved:
    boolean;

}


@Component({
  selector:
    'app-asistencia',

  templateUrl:
    './asistencia.page.html',

  styleUrls: [
    './asistencia.page.scss',
  ],

  standalone:
    false,
})
export class AsistenciaPage
  implements OnInit {


  private readonly apiUrl =
    environment.apiUrl;


  loading =
    false;


  asistenciaLoading =
    false;


  savingAsistencia =
    false;


  students:
    AsistenciaStudent[] =
    [];


  selectedCategory =
    '';


  selectedDate =
    new Date();


  constructor(

    private readonly http:
      HttpClient,

    private readonly toastController:
      ToastController,

  ) {}


  /* ============================= */
  /* INIT                          */
  /* ============================= */

  ngOnInit():
    void {

    this.loadStudents();

  }


  /* ============================= */
  /* FECHA                         */
  /* ============================= */

  get classDate():
    string {

    return new Intl.DateTimeFormat(
      'es-AR',
      {
        weekday:
          'long',

        day:
          'numeric',

        month:
          'long',

        year:
          'numeric',
      },
    ).format(
      this.selectedDate,
    );

  }


  get selectedDateValue():
    string {

    const year =
      this.selectedDate
        .getFullYear();


    const month =
      String(
        this.selectedDate
          .getMonth() +
        1,
      )
        .padStart(
          2,
          '0',
        );


    const day =
      String(
        this.selectedDate
          .getDate(),
      )
        .padStart(
          2,
          '0',
        );


    return (
      `${year}-${month}-${day}`
    );

  }


  /* ============================= */
  /* CARGAR ALUMNOS                */
  /* ============================= */

  loadStudents():
    void {

    this.loading =
      true;


    this.http
      .get<
        ApiResponse<StudentApi[]>
      >(
        `${this.apiUrl}/students?active=true`,
      )
      .subscribe({

        next:
          response => {

            const apiStudents =
              response.result ??
              [];


            this.students =
              apiStudents.map(
                student => ({

                  id:
                    student.id,

                  name:
                    student.name,

                  lastname:
                    student.last_name,

                  course:
                    student.category
                      ?.name ??
                    'Sin categoría',

                  avatar:
                    student.avatar ||
                    'assets/section/usuario.png',

                  status:
                    'pending',

                  saved:
                    false,

                }),
              );


            const availableCategories =
              this.categories;


            if (
              availableCategories.length >
                0 &&
              (
                !this.selectedCategory ||
                !availableCategories.includes(
                  this.selectedCategory,
                )
              )
            ) {

              this.selectedCategory =
                availableCategories[0];

            }


            this.loading =
              false;


            this.loadAsistencia();

          },


        error:
          () => {

            this.students =
              [];


            this.loading =
              false;


            void this.showToast(
              'No se pudieron cargar los alumnos.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* CARGAR ASISTENCIA             */
  /* ============================= */

  loadAsistencia():
    void {

    if (
      this.loading
    ) {

      return;

    }


    this.asistenciaLoading =
      true;


    /*
     * Un día sin registros todavía
     * está "sin marcar".
     */
    this.students.forEach(
      student => {

        student.status =
          'pending';

        student.saved =
          false;

      },
    );


    this.http
      .get<
        ApiResponse<AsistenciaApi[]>
      >(
        `${this.apiUrl}/asistencia?date=${this.selectedDateValue}`,
      )
      .subscribe({

        next:
          response => {

            const asistencias =
              response.result ??
              [];


            asistencias.forEach(
              asistencia => {

                const student =
                  this.students.find(
                    item =>
                      item.id ===
                      asistencia.student.id,
                  );


                if (!student) {
                  return;
                }


                student.saved =
                  true;


                student.status =
                  asistencia.present
                    ? 'present'
                    : 'absent';

              },
            );


            this.asistenciaLoading =
              false;

          },


        error:
          () => {

            this.asistenciaLoading =
              false;


            void this.showToast(
              'No se pudo cargar la asistencia del día.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* CATEGORÍAS                    */
  /* ============================= */

  get categories():
    string[] {

    return [
      ...new Set(

        this.students

          .map(
            student =>
              student.course,
          )

          .filter(
            course =>
              course !==
              'Sin categoría',
          ),

      ),
    ].sort();

  }


  changeCategory(
    category:
      string,
  ):
    void {

    if (
      this.savingAsistencia
    ) {

      return;

    }


    this.selectedCategory =
      category;

  }


  /* ============================= */
  /* ALUMNOS FILTRADOS             */
  /* ============================= */

  get filteredStudents():
    AsistenciaStudent[] {

    if (
      !this.selectedCategory
    ) {

      return [];

    }


    return this.students.filter(
      student =>
        student.course ===
        this.selectedCategory,
    );

  }


  /* ============================= */
  /* CONTADORES                    */
  /* ============================= */

  get presentStudentsCount():
    number {

    return this.filteredStudents
      .filter(
        student =>
          student.status ===
          'present',
      )
      .length;

  }


  get absentStudentsCount():
    number {

    return this.filteredStudents
      .filter(
        student =>
          student.status ===
          'absent',
      )
      .length;

  }


  get pendingStudentsCount():
    number {

    return this.filteredStudents
      .filter(
        student =>
          student.status ===
          'pending',
      )
      .length;

  }


  /* ============================= */
  /* TRACK BY                      */
  /* ============================= */

  trackByStudentId(

    _index:
      number,

    student:
      AsistenciaStudent,

  ):
    string {

    return student.id;

  }


  /* ============================= */
  /* MARCAR PRESENTE               */
  /* ============================= */

  changeStatus(
    student:
      AsistenciaStudent,
  ):
    void {

    if (
      this.savingAsistencia ||
      this.asistenciaLoading
    ) {

      return;

    }


    if (
      student.status ===
      'present'
    ) {

      student.status =
        student.saved
          ? 'absent'
          : 'pending';

      return;

    }


    student.status =
      'present';

  }


  getStatusIcon(
    status:
      AsistenciaStatus,
  ):
    string {

    if (
      status ===
      'present'
    ) {

      return 'checkmark-circle';

    }


    if (
      status ===
      'absent'
    ) {

      return 'close-circle';

    }


    return 'ellipse-outline';

  }


  getStatusLabel(
    status:
      AsistenciaStatus,
  ):
    string {

    if (
      status ===
      'present'
    ) {

      return 'Presente';

    }


    if (
      status ===
      'absent'
    ) {

      return 'Ausente';

    }


    return 'Sin marcar';

  }


  /* ============================= */
  /* GUARDAR ASISTENCIA            */
  /* ============================= */

  async saveAsistencia():
    Promise<void> {

    if (
      this.filteredStudents.length ===
      0 ||
      this.savingAsistencia ||
      this.asistenciaLoading
    ) {

      return;

    }


    this.savingAsistencia =
      true;


    const presentCount =
      this.presentStudentsCount;

    const total =
      this.filteredStudents.length;


    /*
     * El flujo de FUTGOL es simple:
     * se marcan los presentes y al
     * guardar, el resto queda ausente.
     */
    const payload =
      this.filteredStudents.map(
        student => ({

          student_id:
            student.id,

          date:
            this.selectedDateValue,

          present:
            student.status ===
            'present',

        }),
      );


    this.http
      .post<
        ApiResponse<AsistenciaApi[]>
      >(
        `${this.apiUrl}/asistencia`,
        payload,
      )
      .subscribe({

        next:
          () => {

            this.savingAsistencia =
              false;


            /*
             * Volvemos a consultar la base
             * para que la pantalla refleje
             * exactamente lo persistido.
             */
            this.loadAsistencia();


            void this.showToast(

              `Asistencia guardada · ` +
              `${presentCount} de ` +
              `${total} presentes`,

              'success',

            );

          },


        error:
          () => {

            this.savingAsistencia =
              false;


            void this.showToast(
              'No se pudo guardar la asistencia.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* CAMBIAR FECHA                 */
  /* ============================= */

  previousClass():
    void {

    if (
      this.savingAsistencia ||
      this.asistenciaLoading
    ) {

      return;

    }


    const previousDate =
      new Date(
        this.selectedDate,
      );


    previousDate.setDate(
      previousDate.getDate() -
      1,
    );


    this.selectedDate =
      previousDate;


    this.loadAsistencia();

  }


  nextClass():
    void {

    if (
      this.savingAsistencia ||
      this.asistenciaLoading
    ) {

      return;

    }


    const nextDate =
      new Date(
        this.selectedDate,
      );


    nextDate.setDate(
      nextDate.getDate() +
      1,
    );


    this.selectedDate =
      nextDate;


    this.loadAsistencia();

  }


  /* ============================= */
  /* TOAST                         */
  /* ============================= */

  private async showToast(

    message:
      string,

    color:
      | 'success'
      | 'danger',

  ):
    Promise<void> {

    const toast =
      await this.toastController
        .create({

          message,

          duration:
            2200,

          position:
            'bottom',

          color,

          icon:
            color ===
              'success'
              ? 'checkmark-circle-outline'
              : 'alert-circle-outline',

        });


    await toast.present();

  }

}
