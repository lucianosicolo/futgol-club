import {
  Component,
  OnInit,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  ToastController,
} from '@ionic/angular';

import {
  environment,
} from 'src/environments/environment';


interface ApiResponse<T> {
  ok:
    boolean;

  result:
    T;

  msg:
    string;
}


interface LoggedUser {
  id:
    string;

  name:
    string;

  last_name:
    string;

  email:
    string;

  phone:
    string;

  role:
    | 'admin'
    | 'teacher'
    | 'responsible';

  active:
    boolean;
}


interface CategoryApi {
  id:
    string;

  name:
    string;

  active:
    boolean;
}


interface StudentApi {
  id:
    string;

  name:
    string;

  last_name:
    string;

  active:
    boolean;

  category:
    CategoryApi | null;
}


interface NoticeApi {
  id:
    string;

  type:
    'payment'
    | 'training'
    | 'general';

  message:
    string;

  category:
    CategoryApi | null;

  student:
    StudentApi | null;

  created_by: {
    id:
      string;

    name:
      string;

    last_name:
      string;
  };

  created_at:
    string;

  recipientCount?:
    number;
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
export class AvisosPage
  implements OnInit {


  private readonly apiUrl =
    environment.apiUrl;


  loading =
    false;


  publishing =
    false;


  selectedCategory:
    string | 'all' =
    'all';


  selectedType:
    NoticeType =
    'general';


  selectedRecipient:
    string | 'all' =
    'all';


  message =
    'Hola! 👋\n\nQueríamos compartirles un aviso de FUTGOL CLUB ⚽';


  categories:
    CategoryApi[] =
    [];


  students:
    StudentApi[] =
    [];


  notices:
    NoticeApi[] =
    [];


  constructor(

    private readonly http:
      HttpClient,

    private readonly toastController:
      ToastController,

  ) {}


  ngOnInit():
    void {

    if (
      this.canCreateNotices
    ) {

      this.loadAudienceData();

    }


    this.loadNotices();

  }


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


  get selectedStudents():
    StudentApi[] {

    const active =
      this.students
        .filter(
          student =>
            student.active,
        );


    if (
      this.selectedCategory ===
      'all'
    ) {

      return active;

    }


    return active
      .filter(
        student =>
          student.category
            ?.id ===
          this.selectedCategory,
      );

  }


  get audienceLabel():
    string {

    if (
      this.selectedRecipient !==
      'all'
    ) {

      const student =
        this.students.find(
          item =>
            item.id ===
            this.selectedRecipient,
        );


      return student
        ? `${student.name} ${student.last_name}`
        : 'Alumno';

    }


    if (
      this.selectedCategory ===
      'all'
    ) {

      return 'Todo FUTGOL';

    }


    const category =
      this.categories.find(
        item =>
          item.id ===
          this.selectedCategory,
      );


    return category
      ?.name ??
      'Categoría';

  }


  loadAudienceData():
    void {

    this.loading =
      true;


    this.http
      .get<
        ApiResponse<CategoryApi[]>
      >(
        `${this.apiUrl}/categories?active=true`,
      )
      .subscribe({

        next:
          response => {

            this.categories =
              response.result ??
              [];

          },

      });


    this.http
      .get<
        ApiResponse<StudentApi[]>
      >(
        `${this.apiUrl}/students?active=true`,
      )
      .subscribe({

        next:
          response => {

            this.students =
              response.result ??
              [];


            this.loading =
              false;

          },


        error:
          () => {

            this.loading =
              false;


            void this.showToast(
              'No se pudieron cargar los destinatarios.',
              'danger',
            );

          },

      });

  }


  loadNotices():
    void {

    const endpoint =
      this.isResponsible
        ? '/notices/my'
        : '/notices';


    this.http
      .get<
        ApiResponse<NoticeApi[]>
      >(
        `${this.apiUrl}${endpoint}`,
      )
      .subscribe({

        next:
          response => {

            this.notices =
              response.result ??
              [];

          },


        error:
          () => {

            this.notices =
              [];

          },

      });

  }


  changeCategory():
    void {

    this.selectedRecipient =
      'all';

  }


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

        this.message =
          'Hola! 👋\n\nTe recordamos que la cuota del mes se encuentra pendiente.\n\nMuchas gracias.\nFUTGOL CLUB ⚽';

        break;


      case 'training':

        this.message =
          'Hola! 👋\n\nTe recordamos que hoy tenemos entrenamiento.\n\n¡Los esperamos!\nFUTGOL CLUB ⚽';

        break;


      case 'general':

        this.message =
          'Hola! 👋\n\nQueríamos compartirles un aviso de FUTGOL CLUB ⚽';

        break;

    }

  }


  publishNotice():
    void {

    if (
      !this.canCreateNotices ||
      this.publishing
    ) {

      return;

    }


    if (
      !this.message.trim()
    ) {

      void this.showToast(
        'Escribí un mensaje antes de publicarlo.',
        'danger',
      );

      return;

    }


    if (
      this.selectedStudents.length ===
        0 &&
      this.selectedRecipient ===
        'all'
    ) {

      void this.showToast(
        'No hay alumnos activos en esa audiencia.',
        'danger',
      );

      return;

    }


    const payload:
      any = {

      type:
        this.selectedType,

      message:
        this.message.trim(),

    };


    if (
      this.selectedRecipient !==
      'all'
    ) {

      payload.studentId =
        this.selectedRecipient;

    } else if (
      this.selectedCategory !==
      'all'
    ) {

      payload.categoryId =
        this.selectedCategory;

    }


    this.publishing =
      true;


    this.http
      .post<
        ApiResponse<
          NoticeApi & {
            recipientCount:
              number;
          }
        >
      >(
        `${this.apiUrl}/notices`,
        payload,
      )
      .subscribe({

        next:
          response => {

            this.publishing =
              false;


            const count =
              response.result
                .recipientCount;


            void this.showToast(
              `Aviso publicado para ${count} usuario${count === 1 ? '' : 's'}.`,
              'success',
            );


            this.loadNotices();

          },


        error:
          error => {

            this.publishing =
              false;


            const message =
              error?.error
                ?.message ??
              error?.error
                ?.msg ??
              'No se pudo publicar el aviso.';


            void this.showToast(
              Array.isArray(
                message,
              )
                ? message.join(
                    ', ',
                  )
                : String(
                    message,
                  ),
              'danger',
            );

          },

      });

  }


  noticeTypeLabel(
    type:
      NoticeType,
  ):
    string {

    if (
      type ===
      'payment'
    ) {

      return 'Pago';

    }


    if (
      type ===
      'training'
    ) {

      return 'Entrenamiento';

    }


    return 'General';

  }


  noticeAudience(
    notice:
      NoticeApi,
  ):
    string {

    if (
      notice.student
    ) {

      return (
        `${notice.student.name} ` +
        notice.student.last_name
      );

    }


    if (
      notice.category
    ) {

      return notice.category
        .name;

    }


    return 'Todo FUTGOL';

  }


  formatDate(
    value:
      string,
  ):
    string {

    return new Intl.DateTimeFormat(
      'es-AR',
      {
        dateStyle:
          'medium',

        timeStyle:
          'short',
      },
    ).format(
      new Date(
        value,
      ),
    );

  }


  private async showToast(

    message:
      string,

    color:
      'success' |
      'danger',

  ):
    Promise<void> {

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
