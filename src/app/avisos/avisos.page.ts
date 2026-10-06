import {
  Component,
} from '@angular/core';

import {
  ToastController,
} from '@ionic/angular';


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
  selector:
    'app-avisos',

  templateUrl:
    './avisos.page.html',

  styleUrls: [
    './avisos.page.scss',
  ],

  standalone:
    false,
})
export class AvisosPage {


  selectedCategory =
    'Categoría 2013/2014';


  selectedType:
    NoticeType =
    'payment';


  selectedRecipient:
    number | 'all' =
    'all';


  message =
    'Hola! Te recordamos que la cuota del mes se encuentra pendiente. Muchas gracias. FUTGOL CLUB ⚽';


  categories:
    string[] = [

      'Todas',

      'Categoría 2013/2014',

      'Categoría 2015/2016',

      'Categoría 2017/2018',

    ];


  students:
    NoticeStudent[] = [

      {
        id: 1,

        name:
          'Mateo',

        lastname:
          'Torres',

        category:
          'Categoría 2013/2014',

        responsibleName:
          'Carlos Torres',

        phone:
          '542995333209',
      },

      {
        id: 2,

        name:
          'Luca',

        lastname:
          'Fernández',

        category:
          'Categoría 2013/2014',

        responsibleName:
          'María Fernández',

        phone:
          '542995333209',
      },

      {
        id: 3,

        name:
          'Thiago',

        lastname:
          'López',

        category:
          'Categoría 2013/2014',

        responsibleName:
          'Juan López',

        phone:
          '542995333209',
      },

      {
        id: 4,

        name:
          'Benjamín',

        lastname:
          'Ruiz',

        category:
          'Categoría 2013/2014',

        responsibleName:
          'Laura Ruiz',

        phone:
          '542995333209',
      },

      {
        id: 5,

        name:
          'Tomás',

        lastname:
          'Gómez',

        category:
          'Categoría 2015/2016',

        responsibleName:
          'Martín Gómez',

        phone:
          '542995333209',
      },

    ];


  constructor(
    private readonly toastController:
      ToastController,
  ) {}


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


  get canCreateNotices():
    boolean {

    return (

      this.user?.role ===
        'admin' ||

      this.user?.role ===
        'teacher'

    );

  }


  get isResponsible():
    boolean {

    return (
      this.user?.role ===
      'responsible'
    );

  }


  /* ============================= */
  /* ALUMNOS FILTRADOS             */
  /* ============================= */

  get selectedStudents():
    NoticeStudent[] {

    if (
      this.selectedCategory ===
      'Todas'
    ) {

      return this.students;

    }


    return this.students.filter(

      student =>

        student.category ===
        this.selectedCategory,

    );

  }


  /* ============================= */
  /* TIPO DE AVISO                 */
  /* ============================= */

  changeType():
    void {

    if (
      !this.canCreateNotices
    ) {

      return;

    }


    switch (
      this.selectedType
    ) {

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


  /* ============================= */
  /* ENVIAR WHATSAPP               */
  /* ============================= */

  async sendWhatsApp():
    Promise<void> {

    /*
     * Un responsable puede entrar
     * a Avisos pero no crear/enviar.
     */
    if (
      !this.canCreateNotices
    ) {

      const toast =
        await this.toastController
          .create({

            message:
              'No tenés permisos para crear avisos.',

            duration:
              2000,

            position:
              'bottom',

            color:
              'danger',

          });


      await toast.present();

      return;

    }


    if (
      !this.message.trim()
    ) {

      const toast =
        await this.toastController
          .create({

            message:
              'Escribí un mensaje antes de enviarlo.',

            duration:
              2000,

            position:
              'bottom',

            color:
              'danger',

          });


      await toast.present();

      return;

    }


    const firstStudent =
      this.selectedStudents[0];


    if (
      !firstStudent
    ) {

      return;

    }


    const phone =
      firstStudent.phone
        .replace(
          /\D/g,
          '',
        );


    const url =

      `https://wa.me/${phone}` +

      `?text=${encodeURIComponent(
        this.message,
      )}`;


    window.open(
      url,
      '_blank',
    );


    const toast =
      await this.toastController
        .create({

          message:
            'Aviso preparado para enviar por WhatsApp.',

          duration:
            2000,

          position:
            'bottom',

          color:
            'success',

          icon:
            'logo-whatsapp',

        });


    await toast.present();

  }

}