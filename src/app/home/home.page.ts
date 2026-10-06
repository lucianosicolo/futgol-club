import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Component,
  OnInit,
} from '@angular/core';
import { environment } from 'src/environments/environment';


interface LoggedUser {

  id: string;

  name: string;

  last_name: string;

  email: string;

  phone: string;

  role:
    | 'admin'
    | 'teacher'
    | 'responsible';

  active: boolean;

}


interface StudentApi {

  id: string;

  name: string;

  last_name: string;

  active: boolean;

}


interface FeeApi {

  id: string;

  amount:
    number | string;

  status:
    | 'due'
    | 'paid';

  period: string;

  paid_at:
    string | null;

  active: boolean;

}


interface AsistenciaApi {

  id?: string;

  present?: boolean;

  student?: StudentApi;

}


interface ApiResponse<T> {

  ok: boolean;

  result: T;

  msg: string;

}


@Component({
  selector:
    'app-home',

  templateUrl:
    './home.page.html',

  styleUrls: [
    './home.page.scss',
  ],

  standalone:
    false,
})
export class HomePage
  implements OnInit {


  private readonly apiUrl =
  environment.apiUrl;


  /* ============================= */
  /* LOADING                       */
  /* ============================= */

  loadingStudents =
    false;

  loadingFees =
    false;

  loadingRevenue =
    false;

  loadingAsistencia =
    false;


  get loading():
    boolean {

    return (
      this.loadingStudents ||
      this.loadingFees ||
      this.loadingRevenue ||
      this.loadingAsistencia
    );

  }


  /* ============================= */
  /* DATOS                         */
  /* ============================= */

  totalStudents =
    0;

  paidStudents =
    0;

  dueStudents =
    0;

  monthlyRevenue =
    0;

  presentStudents =
    0;

  absentStudents =
    0;


  currentPeriod =
    this.getCurrentPeriod();


  /* ============================= */
  /* USUARIO                       */
  /* ============================= */

  get user():
    LoggedUser | null {

    const storedUser =
      localStorage.getItem(
        'futgol-user',
      );

    if (!storedUser) {
      return null;
    }

    try {

      return JSON.parse(
        storedUser,
      );

    } catch {

      return null;

    }

  }


  get isAdmin():
    boolean {

    return (
      this.user?.role ===
      'admin'
    );

  }


  get isTeacher():
    boolean {

    return (
      this.user?.role ===
      'teacher'
    );

  }


  constructor(
    private readonly http:
      HttpClient,
  ) {}


  /* ============================= */
  /* ENTRAR AL HOME                */
  /* ============================= */

ngOnInit():
  void {

  this.loadDashboard();

}


  /* ============================= */
  /* DASHBOARD                     */
  /* ============================= */

  private loadDashboard():
    void {


    /*
     * ALUMNOS SIEMPRE ES GENERAL.
     * No depende de ningún período.
     */
    this.loadStudents();


    if (
      this.isAdmin
    ) {

      this.loadCurrentPeriodFees();

      this.loadMonthlyRevenue();

      return;

    }


    if (
      this.isTeacher
    ) {

      this.loadTodayAsistencia();

    }

  }


  /* ============================= */
  /* ALUMNOS GENERALES             */
  /* ============================= */

  private loadStudents():
    void {

    this.loadingStudents =
      true;


    this.http
      .get<
        ApiResponse<StudentApi[]>
      >(
        `${this.apiUrl}/students`,
      )
      .subscribe({

        next:
          response => {

            const students =
              response.result ??
              [];


            console.log(
              'ALUMNOS HOME:',
              students,
            );


            /*
             * Todos los alumnos
             * existentes del club.
             */
            this.totalStudents =
              students.length;


            this.loadingStudents =
              false;

          },


        error:
          error => {

            console.error(
              'ERROR ALUMNOS HOME:',
              error,
            );


            this.totalStudents =
              0;


            this.loadingStudents =
              false;

          },

      });

  }


  /* ============================= */
  /* CUOTAS DEL PERÍODO ACTUAL     */
  /* ============================= */

  private loadCurrentPeriodFees():
    void {

    this.loadingFees =
      true;


    const params =
      new HttpParams()

        .set(
          'period',
          this.currentPeriod,
        )

        .set(
          'active',
          'true',
        );


    this.http
      .get<
        ApiResponse<FeeApi[]>
      >(
        `${this.apiUrl}/fees`,
        {
          params,
        },
      )
      .subscribe({

        next:
          response => {

            const fees =
              response.result ??
              [];


            console.log(
              'CUOTAS HOME:',
              this.currentPeriod,
              fees,
            );


            this.paidStudents =
              fees.filter(
                fee =>
                  fee.status ===
                  'paid',
              ).length;


            this.dueStudents =
              fees.filter(
                fee =>
                  fee.status ===
                  'due',
              ).length;


            this.loadingFees =
              false;

          },


        error:
          error => {

            console.error(
              'ERROR CUOTAS HOME:',
              error,
            );


            this.paidStudents =
              0;

            this.dueStudents =
              0;


            this.loadingFees =
              false;

          },

      });

  }


  /* ============================= */
  /* RECAUDACIÓN DEL MES           */
  /* ============================= */

  private loadMonthlyRevenue():
    void {

    this.loadingRevenue =
      true;


    /*
     * Buscamos todos los pagos
     * aprobados y después miramos
     * la fecha real en que se pagaron.
     */
    const params =
      new HttpParams()

        .set(
          'status',
          'paid',
        )

        .set(
          'active',
          'true',
        );


    this.http
      .get<
        ApiResponse<FeeApi[]>
      >(
        `${this.apiUrl}/fees`,
        {
          params,
        },
      )
      .subscribe({

        next:
          response => {

            const fees =
              response.result ??
              [];


            const today =
              new Date();


            this.monthlyRevenue =
              fees

                .filter(
                  fee => {

                    if (
                      !fee.paid_at
                    ) {

                      return false;

                    }


                    const paidDate =
                      new Date(
                        fee.paid_at,
                      );


                    return (

                      paidDate.getMonth() ===
                        today.getMonth() &&

                      paidDate.getFullYear() ===
                        today.getFullYear()

                    );

                  },
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


            console.log(
              'RECAUDACIÓN DEL MES:',
              this.monthlyRevenue,
            );


            this.loadingRevenue =
              false;

          },


        error:
          error => {

            console.error(
              'ERROR RECAUDACIÓN HOME:',
              error,
            );


            this.monthlyRevenue =
              0;


            this.loadingRevenue =
              false;

          },

      });

  }


  /* ============================= */
  /* ASISTENCIA DE HOY             */
  /* ============================= */

  private loadTodayAsistencia():
    void {

    this.loadingAsistencia =
      true;


    const params =
      new HttpParams()

        .set(
          'date',
          this.getTodayDate(),
        );


    this.http
      .get<
        ApiResponse<AsistenciaApi[]>
      >(
        `${this.apiUrl}/asistencia`,
        {
          params,
        },
      )
      .subscribe({

        next:
          response => {

            const asistencias =
              response.result ??
              [];


            console.log(
              'ASISTENCIA HOME:',
              asistencias,
            );


            this.presentStudents =
              asistencias.filter(
                record =>
                  record.present ===
                  true,
              ).length;


            this.absentStudents =
              asistencias.filter(
                record =>
                  record.present ===
                  false,
              ).length;


            this.loadingAsistencia =
              false;

          },


        error:
          error => {

            console.error(
              'ERROR ASISTENCIA HOME:',
              error,
            );


            this.presentStudents =
              0;

            this.absentStudents =
              0;


            this.loadingAsistencia =
              false;

          },

      });

  }


  /* ============================= */
  /* PORCENTAJES CUOTAS            */
  /* ============================= */

  get paidPercentage():
    number {

    const totalFees =
      this.paidStudents +
      this.dueStudents;


    if (!totalFees) {
      return 0;
    }


    return Math.round(
      (
        this.paidStudents /
        totalFees
      ) * 100,
    );

  }


  get duePercentage():
    number {

    const totalFees =
      this.paidStudents +
      this.dueStudents;


    if (!totalFees) {
      return 0;
    }


    return Math.round(
      (
        this.dueStudents /
        totalFees
      ) * 100,
    );

  }


  /* ============================= */
  /* PORCENTAJES ASISTENCIA        */
  /* ============================= */

  get porcentajePresentes():
    number {

    const total =
      this.presentStudents +
      this.absentStudents;


    if (!total) {
      return 0;
    }


    return Math.round(
      (
        this.presentStudents /
        total
      ) * 100,
    );

  }


  get porcentajeAusentes():
    number {

    const total =
      this.presentStudents +
      this.absentStudents;


    if (!total) {
      return 0;
    }


    return Math.round(
      (
        this.absentStudents /
        total
      ) * 100,
    );

  }


  /* ============================= */
  /* PERÍODO ACTUAL                */
  /* ============================= */

  private getCurrentPeriod():
    string {

    const months = [

      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',

    ];


    const today =
      new Date();


    return (
      `${months[
        today.getMonth()
      ]} ${today.getFullYear()}`
    );

  }


  /* ============================= */
  /* FECHA DE HOY                  */
  /* ============================= */

  private getTodayDate():
    string {

    const today =
      new Date();


    const year =
      today.getFullYear();


    const month =
      String(
        today.getMonth() +
        1,
      )
        .padStart(
          2,
          '0',
        );


    const day =
      String(
        today.getDate(),
      )
        .padStart(
          2,
          '0',
        );


    return (
      `${year}-${month}-${day}`
    );

  }

}