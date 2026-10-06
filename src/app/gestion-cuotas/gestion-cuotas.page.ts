import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Component,
} from '@angular/core';

import {
  AlertController,
  ToastController,
} from '@ionic/angular';

import {
  forkJoin,
} from 'rxjs';
import { environment } from 'src/environments/environment';


interface CategoryApi {

  id: string;

  name: string;

  monthly_fee:
    number | string;

  active: boolean;

}


interface StudentApi {

  id: string;

  name: string;

  last_name: string;

  active: boolean;

  category?:
    CategoryApi | null;

}


interface FeeApi {

  id: string;

  student: {
    id: string;
  };

  period: string;

  amount:
    number | string;

  status:
    'due' | 'paid';

  active: boolean;

}


interface ApiResponse<T> {

  ok: boolean;

  result: T;

  msg: string;

}


interface GenerateFeesResponse {

  ok: boolean;

  result: {

    period: string;

    dueDate: string;

    totalStudents: number;

    created: number;

    skipped: number;

    fees:
      FeeApi[];

  };

  msg: string;

}


@Component({
  selector:
    'app-gestion-cuotas',

  templateUrl:
    './gestion-cuotas.page.html',

  styleUrls: [
    './gestion-cuotas.page.scss',
  ],

  standalone:
    false,
})
export class GestionCuotasPage {


  private readonly apiUrl =
   environment.apiUrl;


  private readonly months = [

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


  currentPeriod =
    this.getCurrentPeriod();


  dueDate =
    this.getDefaultDueDate(
      this.currentPeriod,
    );


  categories:
    CategoryApi[] = [];


  students:
    StudentApi[] = [];


  fees:
    FeeApi[] = [];


  loading =
    false;


  generatingFees =
    false;


  savingCategoryId:
    string | null =
    null;


  constructor(

    private readonly http:
      HttpClient,

    private readonly alertController:
      AlertController,

    private readonly toastController:
      ToastController,

  ) {}


  /* ============================= */
  /* ENTRAR A LA PÁGINA            */
  /* ============================= */

  ionViewWillEnter():
    void {

    this.loadData();

  }


  /* ============================= */
  /* CARGAR INFORMACIÓN            */
  /* ============================= */

  loadData():
    void {

    this.loading =
      true;


    const activeParams =
      new HttpParams()
        .set(
          'active',
          'true',
        );


    const feeParams =
      new HttpParams()

        .set(
          'period',
          this.currentPeriod,
        )

        .set(
          'active',
          'true',
        );


    forkJoin({

      categories:
        this.http.get<
          ApiResponse<CategoryApi[]>
        >(
          `${this.apiUrl}/categories`,
          {
            params:
              activeParams,
          },
        ),

      students:
        this.http.get<
          ApiResponse<StudentApi[]>
        >(
          `${this.apiUrl}/students`,
          {
            params:
              activeParams,
          },
        ),

      fees:
        this.http.get<
          ApiResponse<FeeApi[]>
        >(
          `${this.apiUrl}/fees`,
          {
            params:
              feeParams,
          },
        ),

    })
      .subscribe({

        next:
          response => {

            this.categories =
              response.categories
                ?.result ??
              [];


            this.students =
              response.students
                ?.result ??
              [];


            this.fees =
              response.fees
                ?.result ??
              [];


            this.loading =
              false;

          },


        error:
          error => {

            console.error(
              'ERROR CARGANDO GESTIÓN DE CUOTAS:',
              error,
            );


            this.loading =
              false;


            void this.showToast(
              'No se pudo cargar la información.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* PRECIOS POR CATEGORÍA         */
  /* ============================= */

  saveCategoryPrice(
    category:
      CategoryApi,
  ): void {

    if (
      this.savingCategoryId
    ) {
      return;
    }


    const amount =
      Number(
        category.monthly_fee,
      );


    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {

      void this.showToast(
        'Ingresá un importe mayor a $0.',
        'warning',
      );

      return;

    }


    this.savingCategoryId =
      category.id;


    this.http
      .put<
        ApiResponse<CategoryApi>
      >(

        `${this.apiUrl}/categories/${category.id}`,

        {
          monthly_fee:
            amount,
        },

      )
      .subscribe({

        next:
          response => {

            this.savingCategoryId =
              null;


            const updated =
              response.result;


            /*
             * Actualizamos la categoría
             * localmente.
             */
            this.categories =
              this.categories.map(
                item =>
                  item.id ===
                  updated.id
                    ? updated
                    : item,
              );


            /*
             * También actualizamos
             * la categoría dentro de
             * los alumnos para que el
             * total estimado cambie
             * inmediatamente.
             */
            this.students =
              this.students.map(
                student => {

                  if (
                    student.category?.id !==
                    updated.id
                  ) {

                    return student;

                  }


                  return {

                    ...student,

                    category: {
                      ...student.category,
                      ...updated,
                    },

                  };

                },
              );


            void this.showToast(
              `Valor de ${updated.name} actualizado.`,
              'success',
            );

          },


        error:
          error => {

            console.error(
              'ERROR ACTUALIZANDO CATEGORÍA:',
              error,
            );


            this.savingCategoryId =
              null;


            void this.showToast(
              'No se pudo actualizar el valor.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* PERÍODO                       */
  /* ============================= */

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


                  this.dueDate =
                    this.getDefaultDueDate(
                      period,
                    );


                  this.loadData();

                },
            },

          ],

        });


    await alert.present();

  }


  /* ============================= */
  /* CONFIRMAR GENERACIÓN          */
  /* ============================= */

  async confirmGenerateFees():
    Promise<void> {

    if (
      !this.canGenerate
    ) {

      if (
        this.missingPriceCategories
          .length > 0
      ) {

        await this.showToast(
          'Hay categorías sin un valor mensual configurado.',
          'warning',
        );

      }

      return;

    }


    const alert =
      await this.alertController
        .create({

          header:
            'Generar cuotas',

          subHeader:
            this.currentPeriod,

          message:
            `${this.pendingStudentsCount} cuotas serán generadas. ` +
            `Vencimiento: ${this.formatDate(this.dueDate)}. ` +
            `Total estimado: $${this.formatMoney(this.projectedTotal)}.`,

          buttons: [

            {
              text:
                'Cancelar',

              role:
                'cancel',
            },

            {
              text:
                'Generar cuotas',

              handler:
                () => {

                  this.generateFees();

                },
            },

          ],

        });


    await alert.present();

  }


  /* ============================= */
  /* GENERAR CUOTAS                */
  /* ============================= */

  private generateFees():
    void {

    if (
      this.generatingFees
    ) {
      return;
    }


    this.generatingFees =
      true;


    this.http
      .post<
        GenerateFeesResponse
      >(

        `${this.apiUrl}/fees/generate-period`,

        {

          period:
            this.currentPeriod,

          dueDate:
            this.dueDate,

        },

      )
      .subscribe({

        next:
          response => {

            this.generatingFees =
              false;


            const created =
              response.result?.created ??
              0;


            void this.showToast(

              created > 0
                ? `${created} cuotas generadas correctamente.`
                : 'Las cuotas ya estaban generadas.',

              created > 0
                ? 'success'
                : 'warning',

            );


            this.loadData();

          },


        error:
          error => {

            console.error(
              'ERROR GENERANDO CUOTAS:',
              error,
            );


            this.generatingFees =
              false;


            const categories =
              error?.error
                ?.categories;


            if (
              Array.isArray(
                categories,
              ) &&
              categories.length > 0
            ) {

              void this.showToast(
                `Falta configurar: ${categories.join(', ')}`,
                'danger',
              );

              return;

            }


            void this.showToast(
              'No se pudieron generar las cuotas.',
              'danger',
            );

          },

      });

  }


  /* ============================= */
  /* RESUMEN                       */
  /* ============================= */

  get totalStudents():
    number {

    return this.students.length;

  }


  get generatedStudentsCount():
    number {

    return (
      this.totalStudents -
      this.pendingStudentsCount
    );

  }


  get pendingStudentsCount():
    number {

    const generatedIds =
      new Set(

        this.fees

          .map(
            fee =>
              fee.student?.id,
          )

          .filter(
            (
              id,
            ):
              id is string =>
              !!id,
          ),

      );


    return this.students
      .filter(
        student =>
          !generatedIds.has(
            student.id,
          ),
      )
      .length;

  }


  get pendingStudents():
    StudentApi[] {

    const generatedIds =
      new Set(

        this.fees

          .map(
            fee =>
              fee.student?.id,
          )

          .filter(
            (
              id,
            ):
              id is string =>
              !!id,
          ),

      );


    return this.students
      .filter(
        student =>
          !generatedIds.has(
            student.id,
          ),
      );

  }


  get projectedTotal():
    number {

    return this.pendingStudents
      .reduce(
        (
          total,
          student,
        ) => {

          return (
            total +
            Number(
              student.category
                ?.monthly_fee ??
              0,
            )
          );

        },
        0,
      );

  }


  get missingPriceCategories():
    CategoryApi[] {

    return this.categories
      .filter(
        category =>
          Number(
            category.monthly_fee,
          ) <= 0,
      );

  }


  get canGenerate():
    boolean {

    return (

      !this.loading &&

      !this.generatingFees &&

      this.totalStudents > 0 &&

      this.pendingStudentsCount > 0 &&

      this.missingPriceCategories
        .length === 0 &&

      !!this.dueDate

    );

  }


  get allFeesGenerated():
    boolean {

    return (

      this.totalStudents > 0 &&

      this.pendingStudentsCount ===
        0

    );

  }


  /* ============================= */
  /* HELPERS                       */
  /* ============================= */

  private getCurrentPeriod():
    string {

    const today =
      new Date();


    return (
      `${this.months[
        today.getMonth()
      ]} ${today.getFullYear()}`
    );

  }


  private getPeriodOptions():
    string[] {

    const today =
      new Date();


    const periods:
      string[] = [];


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


      periods.push(

        `${this.months[
          date.getMonth()
        ]} ${date.getFullYear()}`,

      );

    }


    return periods;

  }


  private getDefaultDueDate(
    period:
      string,
  ): string {

    const [
      monthName,
      yearText,
    ] =
      period.split(
        ' ',
      );


    const monthIndex =
      this.months.indexOf(
        monthName,
      );


    const year =
      Number(
        yearText,
      );


    if (
      monthIndex === -1 ||
      !year
    ) {

      return '';

    }


    return [

      year,

      String(
        monthIndex + 1,
      ).padStart(
        2,
        '0',
      ),

      '10',

    ].join(
      '-',
    );

  }


  formatMoney(
    value:
      number | string,
  ): string {

    return new Intl
      .NumberFormat(
        'es-AR',
        {
          maximumFractionDigits:
            0,
        },
      )
      .format(
        Number(
          value,
        ) || 0,
      );

  }


  formatDate(
    value:
      string,
  ): string {

    if (!value) {
      return '-';
    }


    const [
      year,
      month,
      day,
    ] =
      value.split(
        '-',
      );


    return (
      `${day}/${month}/${year}`
    );

  }


  private async showToast(

    message:
      string,

    color:
      string =
      'success',

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