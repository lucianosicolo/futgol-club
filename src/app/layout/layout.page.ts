import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
  standalone: false
})
export class LayoutPage {

  constructor(
    private location: Location,
    private router: Router
  ) { }



  goBack(): void {
    /*
     * Si estamos cargando un formulario de pago,
     * siempre volvemos al listado de pagos.
     */
    if (this.router.url.startsWith('/app/nuevo-pago')) {
      void this.router.navigateByUrl('/app/pagos');
      return;
    }

    this.location.back();
  }
  get isHomePage(): boolean {
    return (
      this.router.url === '/app' ||
      this.router.url.startsWith('/app/home')
    );
  }

  get isPaymentsPage(): boolean {
    return (
      this.router.url.startsWith('/app/pagos') ||
      this.router.url.startsWith('/app/nuevo-pago')
    );
  }
}