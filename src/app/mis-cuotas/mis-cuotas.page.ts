import {
  Component,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  ToastController,
} from '@ionic/angular';

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
  avatar: string | null;
  active: boolean;
  category?: Category;
}


interface Fee {
  id: string;

  student: Student;

  period: string;

  amount: number | string;

  status:
    | 'due'
    | 'paid';

  due_date: string;

  paid_at: string | null;

  active: boolean;
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


interface MercadoPagoResponse {

  preferenceId: string;

  checkoutUrl: string;

  externalReference: string;

}


@Component({
  selector: 'app-mis-cuotas',
  templateUrl: './mis-cuotas.page.html',
  styleUrls: ['./mis-cuotas.page.scss'],
  standalone: false,
})
export class MisCuotasPage {


  private readonly apiUrl =
    'http://localhost:3000';


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


  processingFeeId:
    string | null =
    null;


  constructor(

    private readonly http:
      HttpClient,

    private readonly toastController:
      ToastController,

  ) {}


  ngOnInit(): void {

    this.loadData();

  }


  ionViewWillEnter(): void {

    this.loadData();

  }


  /* ============================= */
  /* CARGAR DATOS                 */
  /* ============================= */

  loadData(): void {

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
            'Error cargando cuotas:',
            error,
          );


          this.loading =
            false;


          void this.showToast(
            'No se pudieron cargar las cuotas.',
            'danger',
          );

        },

    });

  }


  /* ============================= */
  /* PERSONAS                     */
  /* ============================= */

  get people():
    Student[] {


    const result:
      Student[] = [];


    if (this.self) {

      result.push(
        this.self,
      );

    }


    result.push(
      ...this.dependents,
    );


    return result;

  }


  /* ============================= */
  /* CUOTAS POR PERSONA           */
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


    return this
      .getFeesForStudent(
        studentId,
      )
      .filter(

        fee =>
          fee.status ===
          'due',

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


  /* ============================= */
  /* MERCADO PAGO                 */
  /* ============================= */

  payWithMercadoPago(
    fee: Fee,
  ): void {


    if (
      fee.status !== 'due'
    ) {

      return;

    }


    if (
      this.processingFeeId ===
      fee.id
    ) {

      return;

    }


    this.processingFeeId =
      fee.id;


    this.http
      .post<MercadoPagoResponse>(

        `${this.apiUrl}/mercadopago/preference`,

        {
          feeId:
            fee.id,
        },

      )
      .subscribe({

        next:
          response => {


            if (
              !response.checkoutUrl
            ) {

              this.processingFeeId =
                null;


              void this.showToast(
                'Mercado Pago no devolvió una URL.',
                'danger',
              );

              return;

            }


            window.location.assign(
              response.checkoutUrl,
            );

          },


        error:
          error => {


            console.error(
              'Error iniciando Mercado Pago:',
              error,
            );


            this.processingFeeId =
              null;


            void this.showToast(
              'No se pudo iniciar el pago.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* LABEL ESTADO                 */
  /* ============================= */

  getStatusLabel(
    status:
      'due' | 'paid',
  ): string {


    return status === 'paid'
      ? 'Pagada'
      : 'Debe';

  }


  /* ============================= */
  /* TOAST                        */
  /* ============================= */

  private async showToast(

    message: string,

    color: string,

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