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
  ToastController,
} from '@ionic/angular';
import { environment } from 'src/environments/environment';


type StudentStatus =
  | 'active'
  | 'inactive';


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

  birth_date: string;

  address: string;

  avatar: string;

  active: boolean;

  category: Category;
}


@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.page.html',
  styleUrls: ['./alumnos.page.scss'],
  standalone: false,
})
export class AlumnosPage
  implements OnInit {


  private readonly apiUrl =
   environment.apiUrl;


  loading =
    true;


  students:
    Student[] =
    [];


  searchTerm =
    '';


  selectedCategory =
    'all';


  selectedStatus:
    StudentStatus | 'all' =
    'all';


  selectedStudent:
    Student | null =
    null;


  isActionSheetOpen =
    false;


  constructor(

    private readonly http:
      HttpClient,

    private readonly alertController:
      AlertController,

    private readonly toastController:
      ToastController,

    private readonly router:
      Router,

  ) {}


  ngOnInit(): void {

    this.loadStudents();

  }


  /*
   * También lo dejamos para que,
   * cuando volvamos desde Nuevo alumno,
   * refresque el listado.
   */

  ionViewWillEnter(): void {

    this.loadStudents();

  }


  /* ============================= */
  /* CARGAR ALUMNOS                */
  /* ============================= */

  loadStudents(): void {


    this.loading =
      true;


    this.http
      .get<
        ApiResponse<Student[]>
      >(
        `${this.apiUrl}/students`,
      )
      .subscribe({

        next:
          response => {


            this.students =
              response.result ??
              [];


            this.loading =
              false;

          },


        error:
          error => {


            console.error(
              'Error cargando alumnos:',
              error,
            );


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
  /* ABRIR ALUMNO                  */
  /* ============================= */

  openStudent(
    student: Student,
  ): void {


    void this.router.navigate(
      [
        '/app/alumno',
        student.id,
      ],
    );

  }


  /* ============================= */
  /* CONTADORES                    */
  /* ============================= */

  get activeCount():
    number {


    return this.students
      .filter(
        student =>
          student.active,
      )
      .length;

  }


  get inactiveCount():
    number {


    return this.students
      .filter(
        student =>
          !student.active,
      )
      .length;

  }


  get totalCount():
    number {

    return this.students.length;

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
              student.category?.name,
          )
          .filter(
            (
              category,
            ): category is string =>
              !!category,
          ),

      ),
    ].sort();

  }


  /* ============================= */
  /* FILTROS                       */
  /* ============================= */

  get hasFilters():
    boolean {


    return (

      this.searchTerm
        .trim() !==
        '' ||

      this.selectedCategory !==
        'all' ||

      this.selectedStatus !==
        'all'

    );

  }


  get filteredStudents():
    Student[] {


    let result =
      [
        ...this.students,
      ];


    /*
     * Nombre, apellido
     * o documento.
     */

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (search) {


      result =
        result.filter(
          student => {


            const fullName =
              `${student.name} ${student.last_name}`
                .toLowerCase();


            const document =
              student.document
                ?.toLowerCase() ??
              '';


            return (

              fullName
                .includes(
                  search,
                ) ||

              document
                .includes(
                  search,
                )

            );

          },
        );

    }


    /*
     * Categoría.
     */

    if (
      this.selectedCategory !==
      'all'
    ) {


      result =
        result.filter(
          student =>
            student.category
              ?.name ===
            this.selectedCategory,
        );

    }


    /*
     * Estado.
     */

    if (
      this.selectedStatus ===
      'active'
    ) {


      result =
        result.filter(
          student =>
            student.active,
        );

    }


    if (
      this.selectedStatus ===
      'inactive'
    ) {


      result =
        result.filter(
          student =>
            !student.active,
        );

    }


    return result;

  }


  filterByStatus(
    status:
      StudentStatus |
      'all',
  ): void {

    this.selectedStatus =
      status;

  }


  clearFilters(): void {


    this.searchTerm =
      '';


    this.selectedCategory =
      'all';


    this.selectedStatus =
      'all';

  }


  /* ============================= */
  /* TRACK BY                      */
  /* ============================= */

  trackByStudentId(

    _index: number,

    student: Student,

  ): string {

    return student.id;

  }


  /* ============================= */
  /* CAMBIAR ESTADO                */
  /* ============================= */

  async toggleStudentStatus(

    student: Student,

    event: Event,

  ): Promise<void> {


    event.stopPropagation();


    const isActive =
      student.active;


    const alert =
      await this.alertController
        .create({

          header:
            isActive
              ? 'Desactivar alumno'
              : 'Reactivar alumno',


          message:

            isActive

              ? `¿Querés desactivar a ${student.name} ${student.last_name}?`

              : `¿Querés reactivar a ${student.name} ${student.last_name}?`,


          buttons: [

            {
              text:
                'Cancelar',

              role:
                'cancel',
            },

            {

              text:
                isActive
                  ? 'Desactivar'
                  : 'Reactivar',

              role:
                isActive
                  ? 'destructive'
                  : undefined,

              handler:
                () => {

                  if (isActive) {

                    this.deactivateStudent(
                      student,
                    );

                  } else {

                    this.reactivateStudent(
                      student,
                    );

                  }

                },

            },

          ],

        });


    await alert.present();

  }


  /* ============================= */
  /* DESACTIVAR                    */
  /* ============================= */

  private deactivateStudent(
    student: Student,
  ): void {


    this.http
      .delete<
        ApiResponse<Student>
      >(
        `${this.apiUrl}/students/${student.id}`,
      )
      .subscribe({

        next:
          () => {


            student.active =
              false;


            void this.showToast(
              'Alumno desactivado.',
              'success',
            );

          },


        error:
          error => {


            console.error(
              'Error desactivando alumno:',
              error,
            );


            void this.showToast(
              'No se pudo desactivar el alumno.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* REACTIVAR                     */
  /* ============================= */

  private reactivateStudent(
    student: Student,
  ): void {


    this.http
      .put<
        ApiResponse<Student>
      >(
        `${this.apiUrl}/students/${student.id}`,
        {
          active:
            true,
        },
      )
      .subscribe({

        next:
          () => {


            student.active =
              true;


            void this.showToast(
              'Alumno reactivado.',
              'success',
            );

          },


        error:
          error => {


            console.error(
              'Error reactivando alumno:',
              error,
            );


            void this.showToast(
              'No se pudo reactivar el alumno.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* ACTION SHEET                  */
  /* ============================= */

  get selectedStudentName():
    string {


    if (
      !this.selectedStudent
    ) {

      return 'Alumno';

    }


    return (
      `${this.selectedStudent.name} ` +
      `${this.selectedStudent.last_name}`
    );

  }


  get studentActionButtons() {


    if (
      !this.selectedStudent
    ) {

      return [];

    }


    if (
      this.selectedStudent.active
    ) {

      return [

        {

          text:
            'Desactivar alumno',

          role:
            'destructive',

          icon:
            'person-remove-outline',

          handler:
            () => {


              if (
                this.selectedStudent
              ) {

                this.deactivateStudent(
                  this.selectedStudent,
                );

              }


              this.closeStudentActions();

            },

        },

        {

          text:
            'Cancelar',

          role:
            'cancel',

        },

      ];

    }


    return [

      {

        text:
          'Reactivar alumno',

        icon:
          'person-add-outline',

        handler:
          () => {


            if (
              this.selectedStudent
            ) {

              this.reactivateStudent(
                this.selectedStudent,
              );

            }


            this.closeStudentActions();

          },

      },

      {

        text:
          'Cancelar',

        role:
          'cancel',

      },

    ];

  }


  openStudentActions(

    student: Student,

    event: Event,

  ): void {


    event.stopPropagation();


    this.selectedStudent =
      student;


    this.isActionSheetOpen =
      true;

  }


  closeStudentActions():
    void {


    this.isActionSheetOpen =
      false;


    this.selectedStudent =
      null;

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