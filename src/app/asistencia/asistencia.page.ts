import { Component, OnInit } from '@angular/core';

import {
  Student,
  AttendanceStatus
} from '../models/student';

import {
  ActionSheetController,
  ToastController
} from '@ionic/angular';


@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
  standalone: false
})
export class AsistenciaPage implements OnInit {


  classDate =
    'miércoles 5 de agosto';


  categories: string[] = [
    'Categoría 2013/2014',
    'Categoría 2015/2016',
    'Categoría 2017/2018'
  ];


  selectedCategory =
    'Categoría 2013/2014';


  students: Student[] = [

    {
      id: 1,
      name: 'Maia',
      lastname: 'Aedo',
      course: 'Categoría 2013/2014',
      avatar: 'assets/section/usuario.png',
      status: 'pending'
    },

    {
      id: 2,
      name: 'Mateo',
      lastname: 'Torres',
      course: 'Categoría 2013/2014',
      avatar: 'assets/section/usuario.png',
      status: 'pending'
    },

    {
      id: 3,
      name: 'Luca',
      lastname: 'Fernández',
      course: 'Categoría 2013/2014',
      avatar: 'assets/section/usuario.png',
      status: 'pending'
    },

    {
      id: 4,
      name: 'Thiago',
      lastname: 'López',
      course: 'Categoría 2013/2014',
      avatar: 'assets/section/usuario.png',
      status: 'pending'
    },


    /* PRUEBA OTRAS CATEGORÍAS */

    {
      id: 5,
      name: 'Benjamín',
      lastname: 'Ruiz',
      course: 'Categoría 2015/2016',
      avatar: 'assets/section/usuario.png',
      status: 'pending'
    },

    {
      id: 6,
      name: 'Tomás',
      lastname: 'Gómez',
      course: 'Categoría 2015/2016',
      avatar: 'assets/section/usuario.png',
      status: 'pending'
    },

    {
      id: 7,
      name: 'Lautaro',
      lastname: 'Pérez',
      course: 'Categoría 2017/2018',
      avatar: 'assets/section/usuario.png',
      status: 'pending'
    }

  ];


  constructor(
    private actionSheetCtrl: ActionSheetController,
    private toastController: ToastController
  ) {}


  ngOnInit(): void {}


  /* ============================= */
  /* CATEGORÍA                     */
  /* ============================= */

  changeCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;

  }


  /* ============================= */
  /* ALUMNOS FILTRADOS             */
  /* ============================= */

  get filteredStudents(): Student[] {

    return this.students.filter(
      student =>
        student.course ===
        this.selectedCategory
    );

  }


  /* ============================= */
  /* CONTADOR                      */
  /* ============================= */

  get presentStudentsCount(): number {

    return this.filteredStudents.filter(
      student =>
        student.status === 'present'
    ).length;

  }


  /* ============================= */
  /* TRACK BY                      */
  /* ============================= */

  trackByStudentId(
    _index: number,
    student: Student
  ): number {

    return student.id;

  }


  /* ============================= */
  /* CAMBIAR ESTADO                */
  /* ============================= */

  changeStatus(
    student: Student
  ): void {

    student.status =
      student.status === 'present'
        ? 'pending'
        : 'present';

  }


  getStatusIcon(
    status: string
  ): string {

    return status === 'present'
      ? 'checkmark-circle'
      : 'ellipse-outline';

  }


  /* ============================= */
  /* ACTION SHEET                  */
  /* ============================= */

  async presentActionSheet(
    student: Student
  ): Promise<void> {

    const actionSheet =
      await this.actionSheetCtrl.create({

        header:
          `${student.name} ${student.lastname}`,

        buttons: [

          {
            text: 'Presente',
            icon: 'checkmark-circle-outline',
            data: {
              status: 'present'
            }
          },

          {
            text: 'Llegó tarde',
            icon: 'time-outline',
            data: {
              status: 'late'
            }
          },

          {
            text: 'Ausente',
            icon: 'close-circle-outline',
            data: {
              status: 'absent'
            }
          },

          {
            text: 'Pendiente',
            icon: 'remove-circle-outline',
            data: {
              status: 'pending'
            }
          },

          {
            text: 'Cancelar',
            icon: 'close-outline',
            role: 'cancel'
          }

        ]

      });


    await actionSheet.present();


    const result =
      await actionSheet.onDidDismiss<{
        status?: AttendanceStatus;
      }>();


    if (
      result.data?.status
    ) {

      student.status =
        result.data.status;

    }

  }


  /* ============================= */
  /* GUARDAR                       */
  /* ============================= */

  async saveAttendance():
    Promise<void> {

    const presentes =
      this.filteredStudents.filter(
        student =>
          student.status === 'present'
      );


    console.log(
      'Categoría:',
      this.selectedCategory
    );

    console.log(
      'Alumnos presentes:',
      presentes
    );


    const toast =
      await this.toastController.create({

        message:
          `Asistencia guardada · ` +
          `${this.presentStudentsCount} de ` +
          `${this.filteredStudents.length} presentes`,

        duration: 2200,

        position: 'bottom',

        color: 'success',

        icon:
          'checkmark-circle-outline'

      });


    await toast.present();

  }


  /* ============================= */
  /* FECHAS                        */
  /* ============================= */

  previousClass(): void {

    console.log(
      'Mostrar entrenamiento anterior'
    );

  }


  nextClass(): void {

    console.log(
      'Mostrar entrenamiento siguiente'
    );

  }

}