import {
  NgModule,
} from '@angular/core';

import {
  RouterModule,
  Routes,
} from '@angular/router';

import {
  LayoutPage,
} from './layout.page';
import { AuthGuard } from '../auth/login/guards/auth.guard';
import { RoleGuard } from '../auth/login/guards/role.guard';




const routes:
  Routes = [

  {
    path: '',

    component:
      LayoutPage,

    canActivate: [
      AuthGuard,
    ],

    children: [


      /* ============================= */
      /* ADMIN / TEACHER               */
      /* ============================= */

      {
        path:
          'home',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'admin',
            'teacher',
          ],
        },

        loadChildren: () =>
          import(
            '../home/home.module'
          )
            .then(
              m =>
                m.HomePageModule,
            ),
      },


      {
        path:
          'asistencia',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'admin',
            'teacher',
          ],
        },

        loadChildren: () =>
          import(
            '../asistencia/asistencia.module'
          )
            .then(
              m =>
                m.AsistenciaPageModule,
            ),
      },


      {
        path:
          'pagos',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'admin',
            'teacher',
          ],
        },

        loadChildren: () =>
          import(
            '../pagos/pagos.module'
          )
            .then(
              m =>
                m.PagosPageModule,
            ),
      },


      {
        path:
          'nuevo-pago',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'admin',
            'teacher',
          ],
        },

        loadChildren: () =>
          import(
            '../nuevo-pago/nuevo-pago.module'
          )
            .then(
              m =>
                m.NuevoPagoPageModule,
            ),
      },


      {
        path:
          'alumnos',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'admin',
            'teacher',
          ],
        },

        loadChildren: () =>
          import(
            '../alumnos/alumnos.module'
          )
            .then(
              m =>
                m.AlumnosPageModule,
            ),
      },


      {
        path:
          'alumno/:id',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'admin',
            'teacher',
          ],
        },

        loadChildren: () =>
          import(
            '../alumno-detalle/alumno-detalle.module'
          )
            .then(
              m =>
                m.AlumnoDetallePageModule,
            ),
      },


      /* ============================= */
      /* MI FUTGOL                     */
      /* ============================= */

      {
        path:
          'familia',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'responsible',
          ],
        },

        loadChildren: () =>
          import(
            '../responsable-home/responsable-home.module'
          )
            .then(
              m =>
                m.ResponsableHomePageModule,
            ),
      },


      {
        path:
          'mis-cuotas',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'responsible',
          ],
        },

        loadChildren: () =>
          import(
            '../mis-cuotas/mis-cuotas.module'
          )
            .then(
              m =>
                m.MisCuotasPageModule,
            ),
      },


      {
        path:
          'responsable-cuotas/:id',

        canActivate: [
          RoleGuard,
        ],

        data: {
          roles: [
            'responsible',
          ],
        },

        loadChildren: () =>
          import(
            '../responsable-home/responsable-home.module'
          )
            .then(
              m =>
                m.ResponsableHomePageModule,
            ),
      },
{
  path: 'nuevo-usuario',

  canActivate: [
    RoleGuard,
  ],

  data: {
    roles: [
      'admin',
      'teacher',
    ],
  },

  loadChildren: () =>
    import(
      '../nuevo-usuario/nuevo-usuario.module'
    )
      .then(
        m =>
          m.NuevoUsuarioPageModule,
      ),
},
{
  path: 'nuevo-alumno',

  canActivate: [
    RoleGuard,
  ],

  data: {
    roles: [
      'admin',
      'teacher',
    ],
  },

  loadChildren: () =>
    import(
      '../nuevo-alumno/nuevo-alumno.module'
    )
      .then(
        m =>
          m.NuevoAlumnoPageModule,
      ),
},
{
  path: 'nuevo-usuario',

  canActivate: [
    RoleGuard,
  ],

  data: {
    roles: [
      'admin',
      'teacher',
    ],
  },

  loadChildren: () =>
    import(
      '../nuevo-usuario/nuevo-usuario.module'
    )
      .then(
        m =>
          m.NuevoUsuarioPageModule,
      ),
},

      /* ============================= */
      /* COMPARTIDAS                   */
      /* ============================= */

      {
        path:
          'perfil',

        loadChildren: () =>
          import(
            '../perfil/perfil.module'
          )
            .then(
              m =>
                m.PerfilPageModule,
            ),
      },


      {
        path:
          'calendario',

        loadChildren: () =>
          import(
            '../calendario/calendario.module'
          )
            .then(
              m =>
                m.CalendarioPageModule,
            ),
      },


      {
        path:
          'avisos',

        loadChildren: () =>
          import(
            '../avisos/avisos.module'
          )
            .then(
              m =>
                m.AvisosPageModule,
            ),
      },


      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

    ],

  },

];


@NgModule({

  imports: [
    RouterModule.forChild(
      routes,
    ),
  ],

  exports: [
    RouterModule,
  ],

})
export class LayoutPageRoutingModule {}