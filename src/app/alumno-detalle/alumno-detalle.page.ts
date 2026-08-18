import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


type StudentTab =
  | 'info'
  | 'payments'
  | 'attendance';


interface StudentDetail {

  id: number;

  name: string;
  lastname: string;

  document: string;

  category: string;

  avatar: string;

  status:
    | 'active'
    | 'inactive';

  birthDate: string;

  responsibleName: string;

  phone: string;

  address: string;

  paymentStatus:
    | 'paid'
    | 'due';

  attendancePercentage: number;

}


@Component({
  selector: 'app-alumno-detalle',
  templateUrl: './alumno-detalle.page.html',
  styleUrls: ['./alumno-detalle.page.scss'],
  standalone: false
})
export class AlumnoDetallePage implements OnInit {


  selectedTab: StudentTab =
    'info';


  student: StudentDetail = {

    id: 1,

    name: 'Mateo',
    lastname: 'Torres',

    document: '45.123.456',

    category: 'Categoría 2013/2014',

    avatar:
      'assets/section/usuario.png',

    status: 'active',

    birthDate: '15/04/2013',

    responsibleName:
      'Carlos Torres',

    phone:
      '11 2345-6789',

    address:
      'Buenos Aires',

    paymentStatus:
      'paid',

    attendancePercentage: 87

  };


  constructor(
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {

    const studentId =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );

    console.log(
      'Alumno:',
      studentId
    );

  }


  selectTab(
    tab: StudentTab
  ): void {

    this.selectedTab = tab;

  }


  sendWhatsApp(): void {

    const phone =
      this.student.phone
        .replace(/\D/g, '');

    window.open(
      `https://wa.me/54${phone}`,
      '_blank'
    );

  }

}