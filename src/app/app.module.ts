import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { NgModule } from '@angular/core';
import {
  IonicModule,
  IonicRouteStrategy
} from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { AuthInterceptor } from './auth/login/Interceptor/auth.interceptor';

registerLocaleData(localeEsAr);

@NgModule({
  declarations: [
    AppComponent
  ],

  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],

providers: [

  provideHttpClient(
    withInterceptorsFromDi(),
  ),

  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },

  {
    provide: RouteReuseStrategy,
    useClass: IonicRouteStrategy,
  },

],

  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }