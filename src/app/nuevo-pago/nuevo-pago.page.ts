import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';


interface PaymentStudent {
  id: number;
  name: string;
  lastname: string;
}


type ValidationStatus =
  | 'pending'
  | 'approved'
  | 'rejected';


interface PaymentRecord {
  id: number;

  studentId: number;
  studentName: string;

  month: string;
  amount: number;

  paymentMethod: string;
  paymentDate: string;

  receiptName: string;

  validationStatus: ValidationStatus;

  createdAt: string;
}


@Component({
  selector: 'app-nuevo-pago',
  templateUrl: './nuevo-pago.page.html',
  styleUrls: ['./nuevo-pago.page.scss'],
  standalone: false
})
export class NuevoPagoPage implements OnInit {

  studentId: number | null = null;

  month = 'Agosto 2026';

  amount: number | null = 70000;

  paymentMethod = 'Transferencia';

  paymentDate =
    new Date()
      .toISOString()
      .slice(0, 10);

  receiptName = '';

  saving = false;


  students: PaymentStudent[] = [
    {
      id: 1,
      name: 'Mateo',
      lastname: 'Torres'
    },
    {
      id: 2,
      name: 'Luca',
      lastname: 'Fernández'
    },
    {
      id: 3,
      name: 'Thiago',
      lastname: 'López'
    },
    {
      id: 4,
      name: 'Benjamín',
      lastname: 'Ruiz'
    },
    {
      id: 5,
      name: 'Tomás',
      lastname: 'Gómez'
    }
  ];


  months = [
    'Enero 2026',
    'Febrero 2026',
    'Marzo 2026',
    'Abril 2026',
    'Mayo 2026',
    'Junio 2026',
    'Julio 2026',
    'Agosto 2026',
    'Septiembre 2026',
    'Octubre 2026',
    'Noviembre 2026',
    'Diciembre 2026'
  ];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}


  ngOnInit(): void {

    /*
     * Cuando venís desde:
     * Pagos → Luca → Registrar pago
     *
     * recibimos:
     * /app/nuevo-pago?studentId=2
     */

    const studentIdParam =
      this.route.snapshot.queryParamMap
        .get('studentId');


    if (studentIdParam) {

      const parsedId =
        Number(studentIdParam);


      const studentExists =
        this.students.some(
          student =>
            student.id === parsedId
        );


      if (studentExists) {
        this.studentId = parsedId;
      }
    }
  }


  /* ============================= */
  /* COMPROBANTE                   */
  /* ============================= */

  onReceiptSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];


    this.receiptName =
      file?.name ?? '';
  }


  /* ============================= */
  /* GUARDAR PAGO                  */
  /* ============================= */

  async savePayment(): Promise<void> {

    if (
      this.studentId === null ||
      !this.month ||
      this.amount === null ||
      this.amount <= 0 ||
      !this.paymentMethod ||
      !this.paymentDate
    ) {

      await this.showToast(
        'Completá todos los campos obligatorios.',
        'danger'
      );

      return;
    }


    const student =
      this.students.find(
        currentStudent =>
          currentStudent.id ===
          this.studentId
      );


    if (!student) {

      await this.showToast(
        'Seleccioná un alumno válido.',
        'danger'
      );

      return;
    }


    /*
     * Para transferencias,
     * Mercado Pago o tarjeta,
     * pedimos comprobante.
     *
     * Para efectivo puede no existir.
     */

    if (
      this.paymentMethod !== 'Efectivo' &&
      !this.receiptName
    ) {

      await this.showToast(
        'Adjuntá el comprobante del pago.',
        'danger'
      );

      return;
    }


    this.saving = true;


    const payment: PaymentRecord = {

      id: Date.now(),

      studentId: student.id,

      studentName:
        `${student.name} ${student.lastname}`,

      month: this.month,

      amount: this.amount,

      paymentMethod:
        this.paymentMethod,

      paymentDate:
        this.paymentDate,

      receiptName:
        this.receiptName,

      /*
       * MUY IMPORTANTE:
       *
       * Todavía NO está pagado.
       * Queda esperando validación
       * del profesor/admin.
       */

      validationStatus:
        'pending',

      createdAt:
        new Date().toISOString()
    };


    try {

      const savedPayments =
        this.getSavedPayments();


      savedPayments.push(
        payment
      );


      localStorage.setItem(
        'futgol-payments',
        JSON.stringify(
          savedPayments
        )
      );


      await this.showToast(
        `Comprobante de ${student.name} enviado para validar.`,
        'success'
      );


      await this.router.navigateByUrl(
        '/app/pagos',
        {
          replaceUrl: true
        }
      );

    } catch (error) {

      console.error(
        'Error guardando el pago:',
        error
      );


      await this.showToast(
        'No se pudo registrar el pago.',
        'danger'
      );

    } finally {

      this.saving = false;
    }
  }


  /* ============================= */
  /* PAGOS GUARDADOS               */
  /* ============================= */

  private getSavedPayments():
    PaymentRecord[] {

    try {

      const storedPayments =
        localStorage.getItem(
          'futgol-payments'
        );


      return storedPayments
        ? JSON.parse(
            storedPayments
          )
        : [];

    } catch (error) {

      console.error(
        'Error leyendo pagos:',
        error
      );

      return [];
    }
  }


  /* ============================= */
  /* TOAST                         */
  /* ============================= */

  private async showToast(
    message: string,
    color: 'success' | 'danger'
  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message,

        duration: 2000,

        position: 'bottom',

        color
      });


    await toast.present();
  }

}