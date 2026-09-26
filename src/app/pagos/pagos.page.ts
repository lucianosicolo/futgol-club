import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Component,
  OnInit,
} from '@angular/core';

import {
  ActivatedRoute,
} from '@angular/router';

import {
  ToastController,
} from '@ionic/angular';


interface MercadoPagoResponse {

  preferenceId: string;

  checkoutUrl: string;

  externalReference: string;

}


interface CategoryApi {

  id: string;

  name: string;

}


interface StudentApi {

  id: string;

  name: string;

  last_name: string;

  avatar: string | null;

  category?: CategoryApi;

}


interface FeeApi {

  id: string;

  student: StudentApi;

  period: string;

  amount: number | string;

  status: 'due' | 'paid';

  due_date: string;

  paid_at: string | null;

  active: boolean;

}


interface FeesResponse {

  ok: boolean;

  result: FeeApi[];

  msg: string;

}


type PaymentStatus =
  | 'paid'
  | 'due';


type PaymentFilter =
  | 'all'
  | PaymentStatus;


interface PaymentStudent {

  /*
   * ID del alumno.
   */
  id: string;

  /*
   * ID de la cuota.
   * Este es el que mandamos
   * a Mercado Pago.
   */
  feeId: string;

  name: string;

  lastname: string;

  category: string;

  avatar: string;

  status: PaymentStatus;

  period: string;

  amount: number;

  paymentDate?: string;

  /*
   * Después los vamos a traer
   * desde el responsable real.
   */
  responsibleName?: string;

  phone?: string;

}


@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: false,
})
export class PagosPage implements OnInit {


  private readonly apiUrl =
    'http://localhost:3000';


  selectedFilter:
    PaymentFilter = 'all';


  currentPeriod =
    'Septiembre 2026';


  students:
    PaymentStudent[] = [];


  loading =
    false;


  constructor(

    private readonly toastController:
      ToastController,

    private readonly route:
      ActivatedRoute,

    private readonly http:
      HttpClient,

  ) { }


  /* ============================= */
  /* INIT                          */
  /* ============================= */

  ngOnInit(): void {

    this.loadFees();

    this.route.queryParamMap.subscribe(
      params => {

        const filter =
          params.get('filter');

        if (
          filter === 'paid' ||
          filter === 'due'
        ) {

          this.selectedFilter =
            filter;

        } else {

          this.selectedFilter =
            'all';

        }

      },
    );

  }

  /* ============================= */
  /* CUANDO ENTRA A LA PÁGINA     */
  /* ============================= */

  ionViewWillEnter(): void {

    this.loadFees();

  }


  /* ============================= */
  /* CARGAR CUOTAS REALES         */
  /* ============================= */

  loadFees(): void {


    this.loading =
      true;


    this.http
      .get<FeesResponse>(
        `${this.apiUrl}/fees`,
      )
      .subscribe({

        next: (
          response,
        ) => {

       

          const fees =
            response?.result ?? [];


          this.students =
            fees.map(
              fee => ({

                id:
                  fee.student.id,

                feeId:
                  fee.id,

                name:
                  fee.student.name,

                lastname:
                  fee.student.last_name,

                category:
                  fee.student.category
                    ?.name ??
                  'Sin categoría',

                avatar:
                  fee.student.avatar ??
                  'assets/section/usuario.png',

                status:
                  fee.status,

                period:
                  fee.period,

                amount:
                  Number(
                    fee.amount,
                  ),

                paymentDate:
                  fee.paid_at ??
                  undefined,

              }),
            );


       

          this.loading =
            false;

        },


        error: (
          error,
        ) => {

          console.error(
            'ERROR GET /fees:',
            error,
          );


          this.students =
            [];

          this.loading =
            false;


          void this.showToast(
            'No se pudieron cargar las cuotas.',
          );

        },

      });

  }payWithMercadoPago(
  student: PaymentStudent,
): void {

  if (
    this.processingFeeId ===
    student.feeId
  ) {
    return;
  }


  this.processingFeeId =
    student.feeId;


  const body = {

    feeId:
      student.feeId,

  };


  this.http
    .post<MercadoPagoResponse>(
      `${this.apiUrl}/mercadopago/preference`,
      body,
    )
    .subscribe({

      next: (
        response,
      ) => {

        if (
          !response.checkoutUrl
        ) {

          this.processingFeeId =
            null;


          void this.showToast(
            'Mercado Pago no devolvió una URL de pago.',
          );

          return;

        }


        window.location.assign(
          response.checkoutUrl,
        );

      },


      error: (
        error,
      ) => {

        console.error(
          'Error iniciando Mercado Pago:',
          error,
        );


        this.processingFeeId =
          null;


        void this.showToast(
          'No se pudo iniciar Mercado Pago.',
        );

      },

    });

}
processingFeeId: string | null = null;
  /* ============================= */
  /* FILTROS                       */
  /* ============================= */

  get filteredStudents():
    PaymentStudent[] {


    if (
      this.selectedFilter ===
      'all'
    ) {

      return this.students;

    }


    return this.students.filter(

      student =>
        student.status ===
        this.selectedFilter,

    );

  }


  setFilter(
    filter: PaymentFilter,
  ): void {

    this.selectedFilter =
      filter;

  }


  /* ============================= */
  /* CONTADORES                    */
  /* ============================= */

  get paidStudentsCount():
    number {


    return this.students.filter(

      student =>
        student.status ===
        'paid',

    ).length;

  }


  get dueStudentsCount():
    number {


    return this.students.filter(

      student =>
        student.status ===
        'due',

    ).length;

  }


  /* ============================= */
  /* ESTADO                        */
  /* ============================= */

  getStatusLabel(
    status: PaymentStatus,
  ): string {


    return status === 'paid'
      ? 'Al día'
      : 'Debe';

  }


  /* ============================= */
  /* WHATSAPP                      */
  /* ============================= */

  sendWhatsAppReminder(

    student:
      PaymentStudent,

    event?:
      Event,

  ): void {


    event?.stopPropagation();


    /*
     * Todavía no estamos cargando
     * responsables desde el backend.
     */

    if (
      !student.phone ||
      !student.responsibleName
    ) {

      void this.showToast(
        'Todavía no hay un responsable asociado para enviar el aviso.',
      );

      return;

    }


    const phone =
      student.phone.replace(
        /\D/g,
        '',
      );


    const message =

      `Hola ${student.responsibleName}, ¿cómo estás? 👋\n\n` +

      `Te recordamos que se encuentra pendiente ` +

      `la cuota de ${student.period} de ` +

      `${student.name} ${student.lastname}.\n\n` +

      `Importe: $${student.amount.toLocaleString('es-AR')}\n\n` +

      `Muchas gracias.\n` +

      `FUTGOL CLUB ⚽`;


    const url =

      `https://wa.me/${phone}` +

      `?text=${encodeURIComponent(message)}`;


    window.open(
      url,
      '_blank',
    );

  }


  /* ============================= */
  /* PERÍODO                       */
  /* ============================= */

  openMonthSelector(): void {


    /*
     * Por ahora dejamos fijo
     * Septiembre 2026 para probar.
     *
     * Después hacemos el selector
     * real.
     */

  

  }


  /* ============================= */
  /* TOAST                         */
  /* ============================= */

  private async showToast(
    message: string,
  ): Promise<void> {


    const toast =
      await this.toastController
        .create({

          message,

          duration:
            2000,

          position:
            'bottom',

          color:
            'success',

        });


    await toast.present();

  }

}