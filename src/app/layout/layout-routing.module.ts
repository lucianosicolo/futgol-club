import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutPage } from './layout.page';

const routes: Routes = [
  {
    path: '',
    component: LayoutPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../home/home.module')
            .then(m => m.HomePageModule)
      },
      {
        path: 'asistencia',
        loadChildren: () =>
          import('../asistencia/asistencia.module')
            .then(m => m.AsistenciaPageModule)
      },
      {
        path: 'pagos',
        loadChildren: () =>
          import('../pagos/pagos.module')
            .then(m => m.PagosPageModule)
      },
      {
        path: 'nuevo-pago',
        loadChildren: () =>
          import('../nuevo-pago/nuevo-pago.module')
            .then(m => m.NuevoPagoPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () =>
          import('../perfil/perfil.module')
            .then(m => m.PerfilPageModule)
      },
      {
        path: 'avisos',
        loadChildren: () =>
          import('../avisos/avisos.module')
            .then(m => m.AvisosPageModule)
      },
      {
        path: 'alumnos',
        loadChildren: () =>
          import('../alumnos/alumnos.module')
            .then(m => m.AlumnosPageModule)
      },
      {
        path: 'alumno/:id',
        loadChildren: () =>
          import('../alumno-detalle/alumno-detalle.module')
            .then(m => m.AlumnoDetallePageModule)
      },
      {
        path: 'calendario',
        loadChildren: () =>
          import('../calendario/calendario.module')
            .then(m => m.CalendarioPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class LayoutPageRoutingModule { }