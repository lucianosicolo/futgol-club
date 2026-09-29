import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

import {
  NgModule,
} from '@angular/core';

import {
  IonicModule,
} from '@ionic/angular';

import {
  NuevoAlumnoPageRoutingModule,
} from './nuevo-alumno-routing.module';

import {
  NuevoAlumnoPage,
} from './nuevo-alumno.page';


@NgModule({

  imports: [

    CommonModule,

    FormsModule,

    IonicModule,

    NuevoAlumnoPageRoutingModule,

  ],

  declarations: [

    NuevoAlumnoPage,

  ],

})
export class NuevoAlumnoPageModule {}