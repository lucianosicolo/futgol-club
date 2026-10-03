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

  role:
    | 'admin'
    | 'teacher'
    | 'responsible';

  active: boolean;

}


@Component({
  selector:
    'app-layout',

  templateUrl:
    './layout.page.html',

  styleUrls: [
    './layout.page.scss',
  ],

  standalone:
    false,
})
export class LayoutPage {


  constructor(

    private readonly location:
      Location,

    private readonly router:
      Router,

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


  get isAdmin():
    boolean {

    return (
      this.user?.role ===
      'admin'
    );

  }


  get isTeacher():
    boolean {

    return (
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
  /* VOLVER                        */
  /* ============================= */

  goBack(): void {

    this.location.back();

  }


  /* ============================= */
  /* HOME                          */
  /* ============================= */

  get isHomePage():
    boolean {


    if (
      this.isResponsible
    ) {

      return this.router.url.startsWith(
        '/app/familia',
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


  /* ============================= */
  /* ADMINISTRATIVO                */
  /* ============================= */

  get isAdministrativePage():
    boolean {

    return (

      this.router.url.startsWith(
        '/app/administrativo',
      ) ||

      this.router.url.startsWith(
        '/app/gestion-cuotas',
      ) ||

      this.router.url.startsWith(
        '/app/pagos',
      )

    );

  }


  /* ============================= */
  /* RESPONSABLE - CUOTAS          */
  /* ============================= */

get isResponsibleFeesPage():
  boolean {

  return this.router.url.startsWith(
    '/app/responsable-cuotas',
  );

}

}