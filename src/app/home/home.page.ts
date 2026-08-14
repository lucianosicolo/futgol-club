import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage {
totalStudents = 138;
paidStudents = 101;
dueStudents = 37;
monthlyRevenue = 2940000;

get paidPercentage(): number {
  return Math.round(
    (this.paidStudents / this.totalStudents) * 100
  );
}

get duePercentage(): number {
  return Math.round(
    (this.dueStudents / this.totalStudents) * 100
  );
}
  resumen = {
    total: 138,
    presentes: 101,
    ausentes: 37,
    recaudacion: 1000
  };

  proximaActividad = {
    fecha: 'Miércoles 5 de agosto',
    hora: '18:00 hs',
    duracion: '1 hora',
    nombre: 'Registro de asistencia',
    categoria: 'Comisión Desarrollo Web'
  };
  clima: any;

  constructor() { }

  get porcentajePresentes(): number {
    if (!this.resumen.total) {
      return 0;
    }

    return Math.round(
      (this.resumen.presentes / this.resumen.total) * 100
    );
  }

  get porcentajeAusentes(): number {
    if (!this.resumen.total) {
      return 0;
    }

    return Math.round(
      (this.resumen.ausentes / this.resumen.total) * 100
    );
  }

  getClimaIcon(): string {
    /*
     * Acá podés conservar exactamente la función que ya tenías.
     * Este ejemplo utiliza el ícono devuelto por OpenWeather.
     */

    if (!this.clima?.weather?.[0]?.icon) {
      return '';
    }

    const icon = this.clima.weather[0].icon;

    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}