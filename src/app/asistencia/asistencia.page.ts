import { Component, OnInit } from '@angular/core';
import {
  Student,
  AttendanceStatus
} from '../models/student';
import {
  ActionSheetController,
  AlertController
} from '@ionic/angular';





@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
  standalone: false
})
export class AsistenciaPage implements OnInit {

  classDate = 'miércoles 5 de agosto';
  classCategory = 'Categoría 2013/2014';

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
  }
];
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController
  ) { }

  ngOnInit(): void { }
  get presentStudentsCount(): number {
    return this.students.filter(
      student => student.status === 'present'
    ).length;
  }

  trackByStudentId(
    _index: number,
    student: Student
  ): number {
    return student.id;
  }

  async presentActionSheet(student: Student): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: `${student.name} ${student.lastname}`,
      buttons: [
        {
          text: 'Presente',
          icon: 'checkmark-circle-outline',
          role: 'selected',
          data: {
            status: 'present'
          }
        },
        {
          text: 'Llegó tarde',
          icon: 'time-outline',
          role: 'selected',
          data: {
            status: 'late'
          }
        },
        {
          text: 'Ausente',
          icon: 'close-circle-outline',
          role: 'selected',
          data: {
            status: 'absent'
          }
        },
        {
          text: 'Pendiente',
          icon: 'remove-circle-outline',
          role: 'selected',
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

    const result = await actionSheet.onDidDismiss<{
      status?: AttendanceStatus;
    }>();

    if (result.data?.status) {
      // this.changeStatus(student, result?.data.status);
    }
  }

  changeStatus(student: Student): void {
    student.status =
      student.status === 'present'
        ? 'pending'
        : 'present';
  }

  getStatusIcon(status: string): string {
    return status === 'present'
      ? 'checkmark-circle'
      : 'ellipse-outline';
  }




  saveAttendance(): void {
    const presentes = this.students.filter(
      student => student.status === 'present'
    );

    console.log('Alumnos presentes:', presentes);
    console.log(`Total presentes: ${presentes.length}`);
  }

  previousClass(): void {
    console.log('Mostrar entrenamiento anterior');
  }

  nextClass(): void {
    console.log('Mostrar entrenamiento siguiente');
  }


}