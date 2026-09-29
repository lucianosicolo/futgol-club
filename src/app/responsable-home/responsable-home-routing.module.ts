import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResponsableHomePage } from './responsable-home.page';

const routes: Routes = [
  {
    path: '',
    component: ResponsableHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResponsableHomePageRoutingModule {}
