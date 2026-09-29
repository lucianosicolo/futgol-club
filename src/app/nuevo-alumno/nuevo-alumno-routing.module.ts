import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevoAlumnoPage } from './nuevo-alumno.page';

const routes: Routes = [
  {
    path: '',
    component: NuevoAlumnoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevoAlumnoPageRoutingModule {}
