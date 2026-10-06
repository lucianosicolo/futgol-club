import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MisCuotasPage } from './mis-cuotas.page';

const routes: Routes = [
  {
    path: '',
    component: MisCuotasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisCuotasPageRoutingModule { }
