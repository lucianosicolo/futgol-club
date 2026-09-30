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
  AlertController,
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

interface UserApi {

  id: string;

  name: string;

  last_name: string;

  phone: string;

  active: boolean;

}
interface FeeResponse {

  ok: boolean;

  result: FeeApi;

  msg: string;

}
interface StudentApi {

  id: string;

  name: string;

  last_name: string;

  avatar: string | null;

  category?: CategoryApi;

  user?: UserApi | null;

  responsibles?: UserApi[];

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

contacts:
  UserApi[];
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

    private readonly alertController:
      AlertController,

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


  console.log(
    'CARGANDO PERÍODO:',
    this.currentPeriod,
  );


  this.http
    .get<FeesResponse>(
      `${this.apiUrl}/fees`,
      {
        params,
      },
    )
    .subscribe({

      next: (
        response,
      ) => {

        const fees =
          response?.result ??
          [];


        console.log(
          'CUOTAS DEL PERÍODO:',
          fees,
        );


          this.students =
  fees.map(
    fee => {

      const contacts = [

        ...(
          fee.student.responsibles ??
          []
        ),

        ...(
          fee.student.user
            ? [
                fee.student.user,
              ]
            : []
        ),

      ]
        .filter(
          contact =>
            contact.active &&
            !!contact.phone,
        )
        .filter(
          (
            contact,
            index,
            array,
          ) =>
            array.findIndex(
              item =>
                item.id ===
                contact.id,
            ) ===
            index,
        );


      return {

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

        contacts,

      };

    },
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

} 

updatingFeeId:
  string | null =
  null;
  /* ============================= */
/* REGISTRAR PAGO                */
/* ============================= */

async registerStudentPayment(
  student:
    PaymentStudent,
): Promise<void> {

  if (
    student.status ===
    'paid'
  ) {

    return;

  }


  const alert =
    await this.alertController
      .create({

        header:
          'Registrar pago',

        subHeader:
          `${student.name} ${student.lastname}`,

        message:
          `¿Confirmar el pago de la cuota de ${student.period} por $${student.amount.toLocaleString('es-AR')}?`,

        buttons: [

          {
            text:
              'Cancelar',

            role:
              'cancel',
          },

          {
            text:
              'Confirmar pago',

            handler:
              () => {

                this.markFeeAsPaid(
                  student,
                );

              },
          },

        ],

      });


  await alert.present();

}
private markFeeAsPaid(
  student:
    PaymentStudent,
): void {

  if (
    this.updatingFeeId ===
    student.feeId
  ) {

    return;

  }


  this.updatingFeeId =
    student.feeId;


  const body = {

    status:
      'paid',

  };


  this.http
    .put<FeeResponse>(
      `${this.apiUrl}/fees/${student.feeId}`,
      body,
    )
    .subscribe({

      next:
        response => {

          console.log(
            'PAGO REGISTRADO:',
            response,
          );


          this.updatingFeeId =
            null;


          /*
           * Volvemos a traer
           * la información real
           * del backend.
           */
          this.loadFees();


          void this.showToast(
            'Pago registrado correctamente.',
          );

        },


      error:
        error => {

          console.error(
            'ERROR REGISTRANDO PAGO:',
            error,
          );


          this.updatingFeeId =
            null;


          void this.showToast(
            'No se pudo registrar el pago.',
          );

        },

    });

}
payWithMercadoPago(
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

async sendWhatsAppReminder(

  student:
    PaymentStudent,

  event?:
    Event,

): Promise<void> {

  event?.stopPropagation();


  const contacts =
    student.contacts ??
    [];


  if (
    contacts.length ===
    0
  ) {

    await this.showToast(
      'Este alumno no tiene un responsable con teléfono cargado.',
    );

    return;

  }


  /*
   * Si hay un solo contacto,
   * abre WhatsApp directamente.
   */
  if (
    contacts.length ===
    1
  ) {

    this.openWhatsAppReminder(
      student,
      contacts[0],
    );

    return;

  }


  /*
   * Si hay más de uno,
   * elegimos a quién avisar.
   */
  const alert =
    await this.alertController
      .create({

        header:
          'Enviar aviso a',

        subHeader:
          `${student.name} ${student.lastname}`,

        inputs:
          contacts.map(
            contact => ({

              type:
                'radio',

              label:
                `${contact.name} ${contact.last_name}`,

              value:
                contact.id,

            }),
          ),

        buttons: [

          {
            text:
              'Cancelar',

            role:
              'cancel',
          },

          {
            text:
              'Continuar',

            handler:
              (
                contactId:
                  string,
              ) => {

                const contact =
                  contacts.find(
                    item =>
                      item.id ===
                      contactId,
                  );


                if (!contact) {
                  return;
                }


                this.openWhatsAppReminder(
                  student,
                  contact,
                );

              },
          },

        ],

      });


  await alert.present();

}

  /* ============================= */
  /* PERÍODO                       */
  /* ============================= */

/* ============================= */
/* PERÍODO                       */
/* ============================= */
private getPeriodOptions():
  string[] {

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


  const periods:
    string[] =
    [];


  /*
   * Mostramos:
   * 6 meses anteriores,
   * mes actual,
   * 6 meses siguientes.
   */
  for (
    let offset = -6;
    offset <= 6;
    offset++
  ) {

    const date =
      new Date(

        today.getFullYear(),

        today.getMonth() +
          offset,

        1,

      );


    const period =
      `${months[
        date.getMonth()
      ]} ${date.getFullYear()}`;


    periods.push(
      period,
    );

  }


  return periods;

}private openWhatsAppReminder(

  student:
    PaymentStudent,

  contact:
    UserApi,

): void {

  const phone =
    contact.phone
      .replace(
        /\D/g,
        '',
      );


  if (!phone) {

    void this.showToast(
      'El responsable no tiene un teléfono válido.',
    );

    return;

  }


  const finalPhone =
    phone.startsWith(
      '54',
    )
      ? phone
      : `54${phone}`;


  const message =
    `Hola ${contact.name}, ¿cómo estás?\n\n` +
    `Te recordamos que se encuentra pendiente la cuota de ${student.period} de ${student.name} ${student.lastname}.\n\n` +
    `Importe: $${student.amount.toLocaleString('es-AR')}\n\n` +
    `Muchas gracias.\n` +
    `FUTGOL CLUB`;


  const url =
    `https://wa.me/${finalPhone}` +
    `?text=${encodeURIComponent(
      message,
    )}`;


  window.open(
    url,
    '_blank',
  );

}
async openMonthSelector():
  Promise<void> {

  const periods =
    this.getPeriodOptions();


  const alert =
    await this.alertController
      .create({

        header:
          'Seleccionar período',

        inputs:
          periods.map(
            period => ({

              type:
                'radio',

              label:
                period,

              value:
                period,

              checked:
                period ===
                this.currentPeriod,

            }),
          ),

        buttons: [

          {
            text:
              'Cancelar',

            role:
              'cancel',
          },

          {
            text:
              'Aceptar',

            handler:
              (
                period:
                  string,
              ) => {

                if (
                  !period ||
                  period ===
                    this.currentPeriod
                ) {

                  return;

                }


                this.currentPeriod =
                  period;


                /*
                 * Cuando cambia de mes,
                 * volvemos a Todos.
                 */
                this.selectedFilter =
                  'all';


                /*
                 * Volvemos a pedir
                 * las cuotas al backend.
                 */
                this.loadFees();

              },
          },

        ],

      });


  await alert.present();

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