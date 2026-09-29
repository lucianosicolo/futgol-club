import {
  Location,
} from '@angular/common';

import {
  Component,
} from '@angular/core';

import {
  Router,
} from '@angular/router';


interface LoggedUser {

  id: string;

  name: string;

  last_name: string;

  email: string;

  phone: string;

  role: string;

  active: boolean;

}


@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
  standalone: false,
})
export class LayoutPage {


  constructor(

    private readonly location:
      Location,

    private readonly router:
      Router,

  ) {}


  /* ============================= */
  /* USUARIO                      */
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


  get isResponsible():
    boolean {

    return (
      this.user?.role ===
      'responsible'
    );

  }


  get isAdminOrTeacher():
    boolean {

    return (
      this.user?.role === 'admin' ||
      this.user?.role === 'teacher'
    );

  }


  /* ============================= */
  /* VOLVER                       */
  /* ============================= */

  goBack(): void {


    if (
      this.router.url.startsWith(
        '/app/nuevo-pago',
      )
    ) {

      void this.router.navigateByUrl(
        '/app/pagos',
      );

      return;

    }


    this.location.back();

  }


  /* ============================= */
  /* PÁGINAS                      */
  /* ============================= */

  get isHomePage():
    boolean {


    if (
      this.isResponsible
    ) {

      return (
        this.router.url ===
          '/app/familia' ||
        this.router.url.startsWith(
          '/app/familia',
        )
      );

    }


    return (
      this.router.url ===
        '/app' ||
      this.router.url.startsWith(
        '/app/home',
      )
    );

  }


  get isPaymentsPage():
    boolean {

    return (
      this.router.url.startsWith(
        '/app/pagos',
      ) ||
      this.router.url.startsWith(
        '/app/nuevo-pago',
      )
    );

  }


  get isResponsibleFeesPage():
    boolean {

    return this.router.url.startsWith(
      '/app/responsable-cuotas',
    );

  }

}