import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionCuotasPageRoutingModule } from './gestion-cuotas-routing.module';
import { GestionCuotasPage } from './gestion-cuotas.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionCuotasPageRoutingModule
  ],
  declarations: [GestionCuotasPage]
})
export class GestionCuotasPageModule {}
