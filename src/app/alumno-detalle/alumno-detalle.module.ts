import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlumnoDetallePageRoutingModule } from './alumno-detalle-routing.module';

import { AlumnoDetallePage } from './alumno-detalle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlumnoDetallePageRoutingModule
  ],
  declarations: [AlumnoDetallePage]
})
export class AlumnoDetallePageModule {}
