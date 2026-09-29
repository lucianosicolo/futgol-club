import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResponsableHomePageRoutingModule } from './responsable-home-routing.module';

import { ResponsableHomePage } from './responsable-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResponsableHomePageRoutingModule
  ],
  declarations: [ResponsableHomePage]
})
export class ResponsableHomePageModule {}
