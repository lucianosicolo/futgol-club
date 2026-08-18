import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';


interface NoticeStudent {
  id: number;

  name: string;
  lastname: string;

  category: string;

  responsibleName: string;
  phone: string;
}


type NoticeType =
  | 'payment'
  | 'training'
  | 'general';


@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.page.html',
  styleUrls: ['./avisos.page.scss'],
  standalone: false
})
export class AvisosPage {


  selectedCategory =
    'Categoría 2013/2014';


  selectedType: NoticeType =
    'payment';


  message =
    'Hola! Te recordamos que la cuota del mes se encuentra pendiente. Muchas gracias. FUTGOL CLUB ⚽';

  categories: string[] = [
    'Todas',
    'Categoría 2013/2014',
    'Categoría 2015/2016',
    'Categoría 2017/2018'
  ];


  students: NoticeStudent[] = [

    {
      id: 1,
      name: 'Mateo',
      lastname: 'Torres',
      category: 'Categoría 2013/2014',
      responsibleName: 'Carlos Torres',
      phone: '542995333209'
    },

    {
      id: 2,
      name: 'Luca',
      lastname: 'Fernández',
      category: 'Categoría 2013/2014',
      responsibleName: 'María Fernández',
      phone: '542995333209'

    },

    {
      id: 3,
      name: 'Thiago',
      lastname: 'López',
      category: 'Categoría 2013/2014',
      responsibleName: 'Juan López',
      phone: '542995333209'

    },

    {
      id: 4,
      name: 'Benjamín',
      lastname: 'Ruiz',
      category: 'Categoría 2013/2014',
      responsibleName: 'Laura Ruiz',
      phone: '542995333209'

    },

    {
      id: 5,
      name: 'Tomás',
      lastname: 'Gómez',
      category: 'Categoría 2015/2016',
      responsibleName: 'Martín Gómez',
      phone: '542995333209'

    }

  ];


  constructor(
    private toastController: ToastController
  ) { }

  selectedRecipient: number | 'all' = 'all';
  get selectedStudents(): NoticeStudent[] {

    if (this.selectedCategory === 'Todas') {
      return this.students;
    }

    return this.students.filter(
      student =>
        student.category === this.selectedCategory
    );

  }


  changeType(): void {

    switch (this.selectedType) {

      case 'payment':

        this.message = `Hola! 👋

Te recordamos que la cuota del mes se encuentra pendiente.

Muchas gracias.
FUTGOL CLUB ⚽`;

        break;


      case 'training':

        this.message = `Hola! 👋

Te recordamos que hoy tenemos entrenamiento.

¡Los esperamos!
FUTGOL CLUB ⚽`;

        break;


      case 'general':

        this.message = `Hola! 👋

Queríamos compartirles un aviso de FUTGOL CLUB ⚽`;

        break;

    }

  }

  async sendWhatsApp(): Promise<void> {

    if (!this.message.trim()) {

      const toast =
        await this.toastController.create({

          message:
            'Escribí un mensaje antes de enviarlo.',

          duration: 2000,

          position: 'bottom',

          color: 'danger'

        });


      await toast.present();

      return;

    }


    const firstStudent =
      this.selectedStudents[0];


    if (!firstStudent) {
      return;
    }


    const phone =
      firstStudent.phone
        .replace(/\D/g, '');


    const url =
      `https://wa.me/${phone}` +
      `?text=${encodeURIComponent(this.message)}`;


    window.open(
      url,
      '_blank'
    );


    const toast =
      await this.toastController.create({

        message:
          'Aviso preparado para enviar por WhatsApp.',

        duration: 2000,

        position: 'bottom',

        color: 'success',

        icon:
          'logo-whatsapp'

      });


    await toast.present();

  }

}