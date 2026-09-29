import {
  Component,
  OnInit,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  forkJoin,
} from 'rxjs';


interface Category {

  id: string;

  name: string;

}


interface Student {

  id: string;

  name: string;

  last_name: string;

  document: string;

  birth_date: string;

  address: string;

  avatar: string | null;

  active: boolean;

  category: Category;

}


interface Fee {

  id: string;

  period: string;

  amount: number | string;

  status:
    | 'due'
    | 'paid';

  due_date: string;

  paid_at: string | null;

  active: boolean;

  student: Student;

}


interface MyStudentsResult {

  self:
    Student | null;

  dependents:
    Student[];

}


interface ApiResponse<T> {

  ok: boolean;

  result: T;

  msg: string;

}


interface LoggedUser {

  id: string;

  name: string;

  last_name: string;

  email: string;

  phone: string;

  role: string;

  active: boolean;

}


@Component({
  selector: 'app-responsable-home',
  templateUrl: './responsable-home.page.html',
  styleUrls: ['./responsable-home.page.scss'],
  standalone: false,
})
export class ResponsableHomePage implements OnInit {


  private readonly apiUrl =
    'http://localhost:3000';


  user:
    LoggedUser | null =
    null;


  self:
    Student | null =
    null;


  dependents:
    Student[] =
    [];


  fees:
    Fee[] =
    [];


  loading =
    true;


  constructor(
    private readonly http:
      HttpClient,
  ) {}
 ngOnInit(): void {

  this.loadUser();

  this.loadData();

}

  ionViewWillEnter(): void {

    this.loadUser();

    this.loadData();

  }


  /* ============================= */
  /* USUARIO                      */
  /* ============================= */

  private loadUser(): void {

    const storedUser =
      localStorage.getItem(
        'futgol-user',
      );


    if (!storedUser) {

      return;

    }


    this.user =
      JSON.parse(
        storedUser,
      );

  }


  /* ============================= */
  /* DATOS                        */
  /* ============================= */

  private loadData(): void {

    this.loading =
      true;


    forkJoin({

      students:
        this.http.get<
          ApiResponse<MyStudentsResult>
        >(
          `${this.apiUrl}/students/my`,
        ),

      fees:
        this.http.get<
          ApiResponse<Fee[]>
        >(
          `${this.apiUrl}/fees/my`,
        ),

    }).subscribe({

      next:
        response => {


          this.self =
            response
              .students
              .result
              .self;


          this.dependents =
            response
              .students
              .result
              .dependents ??
            [];


          this.fees =
            response
              .fees
              .result ??
            [];


          this.loading =
            false;

        },


      error:
        error => {

          console.error(
            'Error cargando Mi FUTGOL:',
            error,
          );


          this.loading =
            false;

        },

    });

  }


  /* ============================= */
  /* CUOTAS                       */
  /* ============================= */

  getFeesForStudent(
    studentId: string,
  ): Fee[] {

    return this.fees.filter(

      fee =>
        fee.student.id ===
        studentId,

    );

  }


  getPendingFees(
    studentId: string,
  ): Fee[] {

    return this.getFeesForStudent(
      studentId,
    ).filter(

      fee =>
        fee.status ===
        'due',

    );

  }


  getPaidFees(
    studentId: string,
  ): Fee[] {

    return this.getFeesForStudent(
      studentId,
    ).filter(

      fee =>
        fee.status ===
        'paid',

    );

  }


  getPendingAmount(
    studentId: string,
  ): number {

    return this
      .getPendingFees(
        studentId,
      )
      .reduce(

        (
          total,
          fee,
        ) =>

          total +
          Number(
            fee.amount,
          ),

        0,

      );

  }

}