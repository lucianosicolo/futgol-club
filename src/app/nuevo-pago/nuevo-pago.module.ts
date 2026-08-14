import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevoPagoPageRoutingModule } from './nuevo-pago-routing.module';

import { NuevoPagoPage } from './nuevo-pago.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevoPagoPageRoutingModule
  ],
  declarations: [NuevoPagoPage]
})
export class NuevoPagoPageModule {}
