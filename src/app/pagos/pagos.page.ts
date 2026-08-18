import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  AlertController,
  ToastController
} from '@ionic/angular';

interface MercadoPagoResponse {
  preferenceId: string;
  checkoutUrl: string;
  externalReference: string;
}
type PaymentStatus =
  | 'paid'
  | 'due';

type PaymentFilter =
  | 'all'
  | PaymentStatus;

type ValidationStatus =
  | 'pending'
  | 'approved'
  | 'rejected';


interface PaymentStudent {
  id: number;

  name: string;
  lastname: string;

  category: string;
  avatar: string;

  status: PaymentStatus;

  period: string;
  amount: number;

  responsibleName: string;
  phone: string;

  paymentMethod?: string;
  paymentDate?: string;
  receiptName?: string;
}


interface SavedPayment {
  id: number;

  studentId: number;

  month: string;
  amount: number;

  paymentMethod: string;
  paymentDate: string;

  receiptName?: string;

  validationStatus: ValidationStatus;

  createdAt: string;
}


@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: false
})
export class PagosPage implements OnInit {

  selectedFilter: PaymentFilter = 'all';

  currentPeriod = 'Agosto 2026';


  students: PaymentStudent[] = [
    {
      id: 1,

      name: 'Mateo',
      lastname: 'Torres',

      category: 'Categoría 2013',

      avatar: 'assets/section/usuario.png',

      status: 'paid',

      period: 'Agosto 2026',

      amount: 1,

      responsibleName: 'Carlos',
      phone: '5491123456789',

      paymentMethod: 'Transferencia',
      paymentDate: '2026-08-04'
    },

    {
      id: 2,

      name: 'Luca',
      lastname: 'Fernández',

      category: 'Categoría 2014',

      avatar: 'assets/section/usuario.png',

      status: 'due',

      period: 'Agosto 2026',

      amount: 1,

      responsibleName: 'María',
      phone: '5491198765432'
    },

    {
      id: 3,

      name: 'Thiago',
      lastname: 'López',

      category: 'Categoría 2015',

      avatar: 'assets/section/usuario.png',

      status: 'paid',

      period: 'Agosto 2026',

      amount: 1,

      responsibleName: 'Juan',
      phone: '5491165432100',

      paymentMethod: 'Efectivo',
      paymentDate: '2026-08-03'
    },

    {
      id: 4,

      name: 'Benjamín',
      lastname: 'Ruiz',

      category: 'Categoría 2016',

      avatar: 'assets/section/usuario.png',

      status: 'due',

      period: 'Agosto 2026',

      amount: 1,

      responsibleName: 'Laura',
      phone: '5491155555555'
    },

    {
      id: 5,

      name: 'Tomás',
      lastname: 'Gómez',

      category: 'Categoría 2017',

      avatar: 'assets/section/usuario.png',

      status: 'paid',

      period: 'Agosto 2026',

      amount: 1,

      responsibleName: 'Martín',
      phone: '5491144444444',

      paymentMethod: 'Transferencia',
      paymentDate: '2026-08-02'
    }
  ];


  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient
  ) { }


  ngOnInit(): void {
    this.applySavedPayments();
  }

  payWithMercadoPago(
    student: PaymentStudent
  ): void {

    const body = {

      studentId:
        student.id,

      studentName:
        `${student.name} ${student.lastname}`,

      period:
        student.period,

      amount:
        student.amount

    };


    this.http
      .post<MercadoPagoResponse>(
        'http://localhost:3000/mercadopago/preference',
        body
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Mercado Pago:',
            response
          );


          if (!response.checkoutUrl) {

            void this.showToast(
              'Mercado Pago no devolvió el checkout.'
            );

            return;
          }


          window.location.href =
            response.checkoutUrl;

        },


        error: (error) => {

          console.error(
            'Error Mercado Pago:',
            error
          );


          void this.showToast(
            'No se pudo iniciar Mercado Pago.'
          );

        }

      });

  }
  ionViewWillEnter(): void {
    this.applySavedPayments();
  }


  /* ============================= */
  /* FILTROS                       */
  /* ============================= */

  get filteredStudents(): PaymentStudent[] {

    if (this.selectedFilter === 'all') {
      return this.students;
    }

    return this.students.filter(
      student =>
        student.status === this.selectedFilter
    );
  }


  setFilter(filter: PaymentFilter): void {
    this.selectedFilter = filter;
  }


  /* ============================= */
  /* CONTADORES                    */
  /* ============================= */

  get paidStudentsCount(): number {

    return this.students.filter(
      student =>
        student.status === 'paid'
    ).length;
  }


  get dueStudentsCount(): number {

    return this.students.filter(
      student =>
        student.status === 'due'
    ).length;
  }





  /* ============================= */
  /* ESTADOS                       */
  /* ============================= */

  getStatusLabel(
    status: PaymentStatus
  ): string {

    return status === 'paid'
      ? 'Al día'
      : 'Debe';
  }


  /* ============================= */
  /* NUEVO PAGO                    */
  /* ============================= */

  registerStudentPayment(
    student: PaymentStudent
  ): void {

    if (student.status === 'paid') {
      return;
    }

    this.router.navigate(
      ['/app/nuevo-pago'],
      {
        queryParams: {
          studentId: student.id
        }
      }
    );
  }


  openRegisterPayment(): void {

    this.router.navigateByUrl(
      '/app/nuevo-pago'
    );
  }


  /* ============================= */
  /* WHATSAPP                      */
  /* ============================= */

  sendWhatsAppReminder(
    student: PaymentStudent,
    event?: Event
  ): void {

    event?.stopPropagation();

    const phone =
      student.phone.replace(/\D/g, '');


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
      '_blank'
    );
  }


  /* ============================= */
  /* VER COMPROBANTE               */
  /* ============================= */

  async viewReceipt(
    student: PaymentStudent
  ): Promise<void> {

    const alert =
      await this.alertController.create({

        header:
          `${student.name} ${student.lastname}`,

        subHeader:
          'Comprobante recibido',

        message:
          student.receiptName
            ? `Archivo: ${student.receiptName}`
            : 'No hay un comprobante disponible.',

        buttons: [
          'Cerrar'
        ]
      });


    await alert.present();
  }


  /* ============================= */
  /* APROBAR PAGO                  */
  /* ============================= */

  async approvePayment(
    student: PaymentStudent
  ): Promise<void> {

    const alert =
      await this.alertController.create({

        header: 'Aprobar pago',

        message:
          `¿Confirmar el pago de ` +
          `${student.name} ${student.lastname} ` +
          `correspondiente a ${student.period}?`,

        buttons: [

          {
            text: 'Cancelar',
            role: 'cancel'
          },

          {
            text: 'Aprobar',
            handler: () => {

              this.updatePaymentValidation(
                student,
                'approved'
              );

              student.status = 'paid';

              void this.showToast(
                'Pago aprobado correctamente.'
              );
            }
          }

        ]
      });


    await alert.present();
  }


  /* ============================= */
  /* RECHAZAR PAGO                 */
  /* ============================= */

  async rejectPayment(
    student: PaymentStudent
  ): Promise<void> {

    const alert =
      await this.alertController.create({

        header: 'Rechazar comprobante',

        message:
          `El pago de ${student.name} ` +
          `${student.lastname} volverá a quedar pendiente.`,

        buttons: [

          {
            text: 'Cancelar',
            role: 'cancel'
          },

          {
            text: 'Rechazar',
            role: 'destructive',

            handler: () => {

              this.updatePaymentValidation(
                student,
                'rejected'
              );

              student.status = 'due';

              student.receiptName =
                undefined;

              void this.showToast(
                'Comprobante rechazado.'
              );
            }
          }

        ]
      });


    await alert.present();
  }


  /* ============================= */
  /* LOCAL STORAGE                 */
  /* ============================= */

  private applySavedPayments(): void {

    try {

      const payments =
        this.getSavedPayments();


      this.students.forEach(
        student => {

          const studentPayments =
            payments.filter(
              payment =>
                payment.studentId === student.id &&
                payment.month === this.currentPeriod
            );


          if (
            studentPayments.length === 0
          ) {
            return;
          }


          const lastPayment =
            studentPayments[
            studentPayments.length - 1
            ];


          student.period =
            lastPayment.month;

          student.amount =
            lastPayment.amount;

          student.paymentMethod =
            lastPayment.paymentMethod;

          student.paymentDate =
            lastPayment.paymentDate;

          student.receiptName =
            lastPayment.receiptName;


          if (
            lastPayment.validationStatus === 'approved'
          ) {

            student.status = 'paid';

          } else {

            student.status = 'due';

          }

        }
      );

    } catch (error) {

      console.error(
        'Error leyendo pagos:',
        error
      );

    }

  }

  private getSavedPayments():
    SavedPayment[] {

    return JSON.parse(
      localStorage.getItem(
        'futgol-payments'
      ) || '[]'
    );
  }


  private updatePaymentValidation(
    student: PaymentStudent,
    validationStatus: ValidationStatus
  ): void {

    const payments =
      this.getSavedPayments();


    const indexes =
      payments
        .map(
          (payment, index) => {

            const matches =
              payment.studentId === student.id &&
              payment.month === student.period;

            return matches
              ? index
              : -1;
          }
        )
        .filter(
          index => index !== -1
        );


    if (indexes.length === 0) {
      return;
    }


    const lastIndex =
      indexes[indexes.length - 1];


    payments[lastIndex].validationStatus =
      validationStatus;


    localStorage.setItem(
      'futgol-payments',
      JSON.stringify(payments)
    );


    this.applySavedPayments();
  }


  /* ============================= */
  /* PERÍODO                       */
  /* ============================= */

  openMonthSelector(): void {

    console.log(
      'Abrir selector de mes'
    );
  }


  /* ============================= */
  /* TOAST                         */
  /* ============================= */

  private async showToast(
    message: string
  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message,

        duration: 2000,

        position: 'bottom',

        color: 'success'
      });


    await toast.present();
  }

}