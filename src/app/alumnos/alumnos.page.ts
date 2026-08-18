import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';


type StudentStatus =
  | 'active'
  | 'inactive';


interface Student {
  id: number;

  name: string;
  lastname: string;

  document: string;

  category: string;

  status: StudentStatus;

  avatar: string;
}


@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.page.html',
  styleUrls: ['./alumnos.page.scss'],
  standalone: false
})
export class AlumnosPage {
  constructor(
    private alertController: AlertController,
    private router: Router
  ) { }
openStudent(
  student: Student
): void {

  this.router.navigate(
    ['/app/alumno', student.id]
  );

}
  searchTerm = '';

  selectedCategory = 'all';

  selectedStatus:
    StudentStatus | 'all' = 'all';


  students: Student[] = [

    {
      id: 1,
      name: 'Juan',
      lastname: 'Carlos',
      document: '45.123.456',
      category: '2013/2014',
      status: 'active',
      avatar: 'assets/section/usuario.png'
    },

    {
      id: 2,
      name: 'Mateo',
      lastname: 'Fernández',
      document: '46.222.111',
      category: '2011/2012',
      status: 'inactive',
      avatar: 'assets/section/usuario.png'
    },

    {
      id: 3,
      name: 'Thiago',
      lastname: 'López',
      document: '47.345.223',
      category: '2013/2014',
      status: 'active',
      avatar: 'assets/section/usuario.png'
    },

    {
      id: 4,
      name: 'Sofía',
      lastname: 'Martínez',
      document: '48.112.321',
      category: '2015/2016',
      status: 'active',
      avatar: 'assets/section/usuario.png'
    },

    {
      id: 5,
      name: 'Valentina',
      lastname: 'Gómez',
      document: '47.932.445',
      category: '2013/2014',
      status: 'inactive',
      avatar: 'assets/section/usuario.png'
    },

    {
      id: 6,
      name: 'Lautaro',
      lastname: 'Rodríguez',
      document: '44.412.813',
      category: '2009/2010',
      status: 'active',
      avatar: 'assets/section/usuario.png'
    }

  ];


  /* CONTADORES */

  get activeCount(): number {

    return this.students.filter(
      student =>
        student.status === 'active'
    ).length;

  }


  get inactiveCount(): number {

    return this.students.filter(
      student =>
        student.status === 'inactive'
    ).length;

  }


  get totalCount(): number {

    return this.students.length;

  }


  /* CATEGORÍAS */

  get categories(): string[] {

    return [
      ...new Set(
        this.students.map(
          student => student.category
        )
      )
    ].sort();

  }


  /* FILTROS ACTIVOS */

  get hasFilters(): boolean {

    return (
      this.searchTerm.trim() !== '' ||
      this.selectedCategory !== 'all' ||
      this.selectedStatus !== 'all'
    );

  }


  /* LISTADO FILTRADO */

  get filteredStudents(): Student[] {

    let result = [...this.students];


    /* Nombre o documento */

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (search) {

      result = result.filter(
        student => {

          const fullName =
            `${student.name} ${student.lastname}`
              .toLowerCase();

          const document =
            student.document
              .toLowerCase();

          return (
            fullName.includes(search) ||
            document.includes(search)
          );

        }
      );

    }


    /* Categoría */

    if (
      this.selectedCategory !== 'all'
    ) {

      result = result.filter(
        student =>
          student.category ===
          this.selectedCategory
      );

    }


    /* Estado */

    if (
      this.selectedStatus !== 'all'
    ) {

      result = result.filter(
        student =>
          student.status ===
          this.selectedStatus
      );

    }


    return result;

  }


  /* LIMPIAR */

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedCategory = 'all';

    this.selectedStatus = 'all';

  }


  /* TRACK BY */

  trackByStudentId(
    _index: number,
    student: Student
  ): number {

    return student.id;

  }
  get selectedStudentName(): string {
    if (!this.selectedStudent) {
      return 'Alumno';
    }

    return `${this.selectedStudent.name} ${this.selectedStudent.lastname}`;
  }
  get studentActionButtons() {

    if (!this.selectedStudent) {
      return [];
    }

    if (this.selectedStudent.status === 'active') {

      return [
        {
          text: 'Desactivar alumno',
          role: 'destructive',
          icon: 'person-remove-outline',
          handler: () => {
            this.deactivateStudent();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ];

    }

    return [
      {
        text: 'Reactivar alumno',
        icon: 'person-add-outline',
        handler: () => {
          this.reactivateStudent();
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ];
  }
  openStudentActions(
    student: Student,
    event: Event
  ): void {

    event.stopPropagation();

    this.selectedStudent = student;

    this.isActionSheetOpen = true;
  }
  deactivateStudent(): void {

    if (!this.selectedStudent) {
      return;
    }

    this.selectedStudent.status = 'inactive';

    this.isActionSheetOpen = false;

    this.selectedStudent = null;
  }
  filterByStatus(
    status: StudentStatus | 'all'
  ): void {

    this.selectedStatus = status;
  }
  async toggleStudentStatus(
    student: Student,
    event: Event
  ): Promise<void> {

    event.stopPropagation();

    const isActive =
      student.status === 'active';

    const action =
      isActive
        ? 'desactivar'
        : 'reactivar';

    const alert =
      await this.alertController.create({

        header:
          isActive
            ? 'Desactivar alumno'
            : 'Reactivar alumno',

        message:
          `¿Querés ${action} a ` +
          `${student.name} ${student.lastname}?`,

        buttons: [

          {
            text: 'Cancelar',
            role: 'cancel'
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

            handler: () => {

              student.status =
                isActive
                  ? 'inactive'
                  : 'active';

            }
          }

        ]

      });

    await alert.present();
  }
  reactivateStudent(): void {

    if (!this.selectedStudent) {
      return;
    }

    this.selectedStudent.status = 'active';

    this.isActionSheetOpen = false;

    this.selectedStudent = null;
  }
  closeStudentActions(): void {
    this.isActionSheetOpen = false;

    this.selectedStudent = null;
  }
  selectedStudent: Student | null = null;

  isActionSheetOpen = false;
}