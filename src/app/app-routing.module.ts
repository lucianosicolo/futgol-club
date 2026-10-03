import {
  NgModule,
} from '@angular/core';

import {
  PreloadAllModules,
  RouterModule,
  Routes,
} from '@angular/router';


const routes:
  Routes = [

  {
    path:
      'login',

    loadChildren: () =>
      import(
        './auth/login/login.module'
      )
        .then(
          m =>
            m.LoginPageModule,
        ),
  },


  {
    path:
      'app',

    loadChildren: () =>
      import(
        './layout/layout.module'
      )
        .then(
          m =>
            m.LayoutPageModule,
        ),
  },


  {
    path:
      '',

    redirectTo:
      'login',

    pathMatch:
      'full',
  },


  {
    path:
      '**',

    redirectTo:
      'login',
  },

];


@NgModule({

  imports: [

    RouterModule.forRoot(
      routes,
      {

        preloadingStrategy:
          PreloadAllModules,

        useHash:
          true,

      },
    ),

  ],

  exports: [
    RouterModule,
  ],

})
export class AppRoutingModule {}