import {
  Component,
  OnInit,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  AlertController,
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


interface CategoryApi {

  id:
    string;

  name:
    string;

  active:
    boolean;

}


type ActivityType =
  | 'training'
  | 'match'
  | 'general';


interface Activity {

  id:
    string;

  date:
    string;

  time:
    string;

  duration_minutes:
    number;

  title:
    string;

  type:
    ActivityType;

  category:
    CategoryApi | null;

  location:
    string | null;

  opponent:
    string | null;

  created_by: {

    id:
      string;

    name:
      string;

    last_name:
      string;

  };

}


@Component({
  selector:
    'app-calendario',

  templateUrl:
    './calendario.page.html',

  styleUrls: [
    './calendario.page.scss',
  ],

  standalone:
    false,
})
export class CalendarioPage
  implements OnInit {


  private readonly apiUrl =
    environment.apiUrl;


  selectedDate =
    this.todayValue();


  activities:
    Activity[] =
    [];


  categories:
    CategoryApi[] =
    [];


  loading =
    false;


  saving =
    false;


  showForm =
    false;

  editingId: string | null = null;


  newTitle =
    'Entrenamiento';


  newType:
    ActivityType =
    'training';


  newTime =
    '18:00';


  newDurationMinutes =
    90;


  newCategoryId =
    '';


  newLocation =
    '';


  newOpponent =
    '';


  constructor(

    private readonly http:
      HttpClient,

    private readonly toastController:
      ToastController,

    private readonly alertController:
      AlertController,

  ) {}


  ngOnInit():
    void {

    this.loadCategories();

    this.loadActivities();

  }


  get selectedActivities():
    Activity[] {

    return this.activities;

  }


  get selectedDateLabel():
    string {

    const date =
      new Date(
        `${this.selectedDate}T12:00:00`,
      );


    return new Intl.DateTimeFormat(
      'es-AR',
      {
        weekday:
          'long',

        day:
          'numeric',

        month:
          'long',
      },
    )
      .format(
        date,
      );

  }


  selectDate(
    event:
      CustomEvent,
  ):
    void {

    const value =
      event.detail.value;


    if (
      typeof value !==
      'string'
    ) {

      return;

    }


    this.selectedDate =
      value.substring(
        0,
        10,
      );


    this.showForm =
      false;
    this.editingId = null;
    this.resetForm();

    this.loadActivities();

  }


  addActivity(): void {
    if (this.saving) return;
    this.showForm = !this.showForm;
    this.editingId = null;
    this.resetForm();
  }

  editActivity(activity: Activity): void {
    if (this.saving) return;
    this.editingId = activity.id;
    this.showForm = true;
    this.newTitle = activity.title;
    this.newType = activity.type;
    this.newTime = activity.time;
    this.newDurationMinutes = activity.duration_minutes;
    this.newCategoryId = activity.category?.id || '';
    this.newLocation = activity.location || '';
    this.newOpponent = activity.opponent || '';
  }


  changeType():
    void {

    if (
      this.newType ===
      'training' &&
      (
        !this.newTitle ||
        this.newTitle ===
          'Partido' ||
        this.newTitle ===
          'Actividad'
      )
    ) {

      this.newTitle =
        'Entrenamiento';

    }


    if (
      this.newType ===
      'match' &&
      (
        !this.newTitle ||
        this.newTitle ===
          'Entrenamiento' ||
        this.newTitle ===
          'Actividad'
      )
    ) {

      this.newTitle =
        'Partido';

    }


    if (
      this.newType ===
      'general' &&
      (
        !this.newTitle ||
        this.newTitle ===
          'Entrenamiento' ||
        this.newTitle ===
          'Partido'
      )
    ) {

      this.newTitle =
        'Actividad';

    }

  }


  createActivity():
    void {

    if (
      this.saving
    ) {

      return;

    }


    if (
      !this.newTitle.trim()
    ) {

      void this.showToast(
        'Ingresá un nombre para la actividad.',
        'danger',
      );

      return;

    }


    const duration =
      Number(
        this.newDurationMinutes,
      );


    if (
      !Number.isInteger(
        duration,
      ) ||
      duration <= 0 ||
      duration > 600
    ) {

      void this.showToast(
        'Ingresá una duración válida.',
        'danger',
      );

      return;

    }


    const payload:
      any = {

      title:
        this.newTitle.trim(),

      type:
        this.newType,

      date:
        this.selectedDate,

      time:
        this.newTime,

      duration_minutes:
        duration,

    };


    if (
      this.newCategoryId
    ) {

      payload.categoryId =
        this.newCategoryId;

    }


    if (
      this.newLocation.trim()
    ) {

      payload.location =
        this.newLocation.trim();

    }


    if (
      this.newOpponent.trim()
    ) {

      payload.opponent =
        this.newOpponent.trim();

    }


    this.saving =
      true;


    const editingId = this.editingId;
    const request = editingId
      ? this.http.patch<ApiResponse<Activity>>(
          `${this.apiUrl}/calendar-events/${editingId}`, payload,
        )
      : this.http.post<ApiResponse<Activity>>(
          `${this.apiUrl}/calendar-events`, payload,
        );
    request
      .subscribe({

        next:
          () => {

            this.saving =
              false;


            this.showForm =
              false;


            this.editingId = null;
            this.resetForm();


            this.loadActivities();


            void this.showToast(
              editingId ? 'Actividad actualizada.' : 'Actividad guardada.',
              'success',
            );

          },


        error:
          error => {

            this.saving =
              false;


            const message =
              error?.error
                ?.message ??
              error?.error
                ?.msg ??
              'No se pudo guardar la actividad.';


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


  async deleteActivity(
    activity:
      Activity,
  ):
    Promise<void> {

    const alert =
      await this.alertController
        .create({

          header:
            'Eliminar actividad',

          message:
            `¿Querés eliminar "${activity.title}" del calendario?`,

          buttons: [

            {
              text:
                'Cancelar',

              role:
                'cancel',
            },

            {
              text:
                'Eliminar',

              role:
                'destructive',

              handler:
                () => {

                  this.confirmDelete(
                    activity,
                  );

                },
            },

          ],

        });


    await alert.present();

  }


  durationLabel(
    minutes:
      number,
  ):
    string {

    if (
      minutes < 60
    ) {

      return `${minutes} min`;

    }


    const hours =
      Math.floor(
        minutes /
        60,
      );

    const rest =
      minutes %
      60;


    if (
      rest ===
      0
    ) {

      return `${hours} h`;

    }


    return `${hours} h ${rest} min`;

  }


  typeLabel(
    type:
      ActivityType,
  ):
    string {

    if (
      type ===
      'training'
    ) {

      return 'Entrenamiento';

    }


    if (
      type ===
      'match'
    ) {

      return 'Partido';

    }


    return 'Actividad';

  }


  private loadActivities():
    void {

    this.loading =
      true;


    this.http
      .get<
        ApiResponse<Activity[]>
      >(
        `${this.apiUrl}/calendar-events?date=${this.selectedDate}`,
      )
      .subscribe({

        next:
          response => {

            this.activities =
              response.result ??
              [];


            this.loading =
              false;

          },


        error:
          () => {

            this.activities =
              [];


            this.loading =
              false;


            void this.showToast(
              'No se pudo cargar el calendario.',
              'danger',
            );

          },

      });

  }


  private loadCategories():
    void {

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

  }


  private confirmDelete(
    activity:
      Activity,
  ):
    void {

    this.http
      .delete<
        ApiResponse<Activity>
      >(
        `${this.apiUrl}/calendar-events/${activity.id}`,
      )
      .subscribe({

        next:
          () => {

            this.loadActivities();


            void this.showToast(
              'Actividad eliminada.',
              'success',
            );

          },


        error:
          () => {

            void this.showToast(
              'No se pudo eliminar la actividad.',
              'danger',
            );

          },

      });

  }


  private resetForm():
    void {

    this.newTitle =
      'Entrenamiento';

    this.newType =
      'training';

    this.newTime =
      '18:00';

    this.newDurationMinutes =
      90;

    this.newCategoryId =
      '';

    this.newLocation =
      '';

    this.newOpponent =
      '';

  }


  private todayValue():
    string {

    const now =
      new Date();


    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() +
        1,
      )
        .padStart(
          2,
          '0',
        );

    const day =
      String(
        now.getDate(),
      )
        .padStart(
          2,
          '0',
        );


    return `${year}-${month}-${day}`;

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
