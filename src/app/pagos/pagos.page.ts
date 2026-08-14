import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  ToastController
} from '@ionic/angular';

type PaymentStatus = 'paid' | 'due';
type PaymentFilter = 'all' | PaymentStatus;

interface PaymentStudent {
  id: number;
  name: string;
  lastname: string;
  category: string;
  avatar: string;
  status: PaymentStatus;
  period: string;
}

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: false
})
export class PagosPage implements OnInit {

  selectedFilter: PaymentFilter = 'all';

  students: PaymentStudent[] = [
    {
      id: 1,
      name: 'Mateo',
      lastname: 'Torres',
      category: 'Categoría 2013',
      avatar: 'assets/section/usuario.png',
      status: 'paid',
      period: 'Agosto 2026'
    },
    {
      id: 2,
      name: 'Luca',
      lastname: 'Fernández',
      category: 'Categoría 2014',
      avatar: 'assets/section/usuario.png',
      status: 'due',
      period: 'Agosto 2026'
    },
    {
      id: 3,
      name: 'Thiago',
      lastname: 'López',
      category: 'Categoría 2015',
      avatar: 'assets/section/usuario.png',
      status: 'paid',
      period: 'Agosto 2026'
    },
    {
      id: 4,
      name: 'Benjamín',
      lastname: 'Ruiz',
      category: 'Categoría 2016',
      avatar: 'assets/section/usuario.png',
      status: 'due',
      period: 'Agosto 2026'
    },
    {
      id: 5,
      name: 'Tomás',
      lastname: 'Gómez',
      category: 'Categoría 2017',
      avatar: 'assets/section/usuario.png',
      status: 'paid',
      period: 'Agosto 2026'
    }
  ];

constructor(
  private alertController: AlertController,
  private toastController: ToastController,
  private router: Router
) {}

  ngOnInit(): void {}

  get filteredStudents(): PaymentStudent[] {
    if (this.selectedFilter === 'all') {
      return this.students;
    }

    return this.students.filter(
      student => student.status === this.selectedFilter
    );
  }

  setFilter(filter: PaymentFilter): void {
    this.selectedFilter = filter;
  }

  getStatusLabel(status: PaymentStatus): string {
    return status === 'paid' ? 'Al día' : 'Debe';
  }

  async togglePaymentStatus(
    student: PaymentStudent
  ): Promise<void> {
    const newStatus: PaymentStatus =
      student.status === 'paid' ? 'due' : 'paid';

    const alert = await this.alertController.create({
      header: `${student.name} ${student.lastname}`,
      message:
        newStatus === 'paid'
          ? '¿Registrar el pago de este alumno?'
          : '¿Marcar este pago como pendiente?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            student.status = newStatus;

            const message =
              newStatus === 'paid'
                ? 'Pago registrado correctamente.'
                : 'Pago marcado como pendiente.';

            void this.showToast(message);
          }
        }
      ]
    });

    await alert.present();
  }


ionViewWillEnter(): void {
  this.applySavedPayments();
}
registerStudentPayment(student: PaymentStudent): void {
  if (student.status === 'paid') {
    return;
  }

  this.router.navigate(['/app/nuevo-pago'], {
    queryParams: {
      studentId: student.id
    }
  });
}
get paidStudentsCount(): number {
  return this.students.filter(
    student => student.status === 'paid'
  ).length;
}

get dueStudentsCount(): number {
  return this.students.filter(
    student => student.status === 'due'
  ).length;
}
openMonthSelector(): void {
  console.log('Abrir selector de mes');
}
openRegisterPayment(): void {
  this.router.navigateByUrl('/nuevo-pago');
}
private applySavedPayments(): void {
  try {
    const savedPayments = JSON.parse(
      localStorage.getItem('futgol-payments') || '[]'
    );

    this.students.forEach(student => {
      const studentPayments = savedPayments.filter(
        (payment: any) => payment.studentId === student.id
      );

      const lastPayment =
        studentPayments[studentPayments.length - 1];

      if (lastPayment) {
        student.status = 'paid';
        student.period = lastPayment.month;
      }
    });
  } catch (error) {
    console.error('Error leyendo pagos:', error);
  }
}
  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });

    await toast.present();
  }
}