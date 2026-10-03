import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionCuotasPage } from './gestion-cuotas.page';

const routes: Routes = [
  {
    path: '',
    component: GestionCuotasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionCuotasPageRoutingModule {}
