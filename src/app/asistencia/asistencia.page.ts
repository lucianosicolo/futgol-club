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


interface ApiResponse<T> {
  ok: boolean;
  result: T;
  msg: string;
}


interface CategoryApi {
  id: string;
  name: string;
  active: boolean;
}


interface StudentApi {
  id: string;

  name: string;
  last_name: string;

  document: string;
  birth_date: string;
  address: string;

  avatar: string | null;

  active: boolean;

  category?: CategoryApi | null;
}


interface AttendanceApi {
  id: string;

  date: string;

  present: boolean;

  student: {
    id: string;
    name: string;
    last_name: string;
  };

  created_at?: string;
  updated_at?: string;
}


type AttendanceStatus =
  | 'pending'
  | 'present';


interface AttendanceStudent {
  id: string;

  name: string;
  lastname: string;

  course: string;

  avatar: string;

  status: AttendanceStatus;
}


@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
  standalone: false,
})
export class AsistenciaPage
  implements OnInit {


  private readonly apiUrl =
    'http://localhost:3000';


  loading =
    false;


  attendanceLoading =
    false;


  savingAttendance =
    false;


  students:
    AttendanceStudent[] =
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

  ngOnInit(): void {

    this.loadStudents();

  }


  ionViewWillEnter(): void {

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
      ).padStart(
        2,
        '0',
      );


    const day =
      String(
        this.selectedDate
          .getDate(),
      ).padStart(
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

  loadStudents(): void {

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


            console.log(
              'ALUMNOS RECIBIDOS:',
              apiStudents,
            );


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


            /*
             * Después de cargar alumnos,
             * recuperamos la asistencia
             * de la fecha seleccionada.
             */
            this.loadAttendance();

          },


        error:
          error => {

            console.error(
              'Error cargando alumnos:',
              error,
            );


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
  /* CARGAR ASISTENCIA DEL DÍA     */
  /* ============================= */

  loadAttendance(): void {

    this.attendanceLoading =
      true;


    /*
     * Primero dejamos a todos
     * sin marcar.
     */
    this.students.forEach(
      student => {

        student.status =
          'pending';

      },
    );


    this.http
      .get<
        ApiResponse<AttendanceApi[]>
      >(
        `${this.apiUrl}/asistencia?date=${this.selectedDateValue}`,
      )
      .subscribe({

        next:
          response => {

            const attendances =
              response.result ??
              [];


            console.log(
              'ASISTENCIA DEL DÍA:',
              attendances,
            );


            attendances.forEach(
              attendance => {

                const student =
                  this.students.find(
                    item =>
                      item.id ===
                      attendance.student.id,
                  );


                if (!student) {

                  return;

                }


                student.status =
                  attendance.present
                    ? 'present'
                    : 'pending';

              },
            );


            this.attendanceLoading =
              false;

          },


        error:
          error => {

            console.error(
              'Error cargando asistencia:',
              error,
            );


            this.attendanceLoading =
              false;

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
    category: string,
  ): void {

    this.selectedCategory =
      category;

  }


  /* ============================= */
  /* ALUMNOS FILTRADOS             */
  /* ============================= */

  get filteredStudents():
    AttendanceStudent[] {

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


  get pendingStudentsCount():
    number {

    return (
      this.filteredStudents.length -
      this.presentStudentsCount
    );

  }


  /* ============================= */
  /* TRACK BY                      */
  /* ============================= */

  trackByStudentId(

    _index: number,

    student:
      AttendanceStudent,

  ): string {

    return student.id;

  }


  /* ============================= */
  /* MARCAR PRESENTE               */
  /* ============================= */

  changeStatus(
    student:
      AttendanceStudent,
  ): void {

    student.status =
      student.status ===
        'present'
        ? 'pending'
        : 'present';

  }


  getStatusIcon(
    status:
      AttendanceStatus,
  ): string {

    return status ===
      'present'
      ? 'checkmark-circle'
      : 'ellipse-outline';

  }


  /* ============================= */
  /* GUARDAR ASISTENCIA            */
  /* ============================= */

  async saveAttendance():
    Promise<void> {

    if (
      this.filteredStudents.length ===
      0
    ) {

      await this.showToast(
        'No hay alumnos en esta categoría.',
        'danger',
      );

      return;

    }


    this.savingAttendance =
      true;


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


    console.log(
      'GUARDANDO ASISTENCIA:',
      payload,
    );


    this.http
      .post<
        ApiResponse<AttendanceApi[]>
      >(
        `${this.apiUrl}/attendances`,
        payload,
      )
      .subscribe({

        next:
          response => {

            console.log(
              'ASISTENCIA GUARDADA:',
              response,
            );


            this.savingAttendance =
              false;


            void this.showToast(

              `Asistencia guardada · ` +
              `${this.presentStudentsCount} de ` +
              `${this.filteredStudents.length} presentes`,

              'success',

            );

          },


        error:
          error => {

            console.error(
              'ERROR GUARDANDO ASISTENCIA:',
              error,
            );


            this.savingAttendance =
              false;


            void this.showToast(
              'No se pudo guardar la asistencia.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* NAVEGACIÓN DE FECHA           */
  /* ============================= */

  previousClass(): void {

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


    this.loadAttendance();

  }


  nextClass(): void {

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


    this.loadAttendance();

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

          icon:
            color ===
              'success'
              ? 'checkmark-circle-outline'
              : 'alert-circle-outline',

        });


    await toast.present();

  }

}