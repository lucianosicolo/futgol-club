import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NuevoPagoPage } from './nuevo-pago.page';

const routes: Routes = [
  {
    path: '',
    component: NuevoPagoPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class NuevoPagoPageRoutingModule {}