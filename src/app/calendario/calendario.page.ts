import { Component } from '@angular/core';


interface Activity {

  id: number;

  date: string;

  time: string;

  duration: string;

  name: string;

  category: string;

}


@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: false
})
export class CalendarioPage {


  selectedDate =
    '2026-08-17';


  activities: Activity[] = [

    {
      id: 1,
      date: '2026-08-17',
      time: '18:00',
      duration: '1 h 30 min',
      name: 'Entrenamiento',
      category: 'Categoría 2013/2014'
    },

    {
      id: 2,
      date: '2026-08-17',
      time: '19:30',
      duration: '1 h 30 min',
      name: 'Entrenamiento',
      category: 'Categoría 2015/2016'
    },

    {
      id: 3,
      date: '2026-08-19',
      time: '18:00',
      duration: '1 h 30 min',
      name: 'Entrenamiento',
      category: 'Categoría 2011/2012'
    },

    {
      id: 4,
      date: '2026-08-22',
      time: '10:00',
      duration: '2 h',
      name: 'Partido amistoso',
      category: 'Categoría 2013/2014'
    }

  ];


  get selectedActivities(): Activity[] {

    return this.activities.filter(
      activity =>
        activity.date ===
        this.selectedDate
    );

  }


  get selectedDateLabel(): string {

    const date =
      new Date(
        `${this.selectedDate}T12:00:00`
      );


    return new Intl.DateTimeFormat(
      'es-AR',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }
    )
      .format(date);

  }


  selectDate(event: CustomEvent): void {

    const value =
      event.detail.value;


    if (
      typeof value !== 'string'
    ) {
      return;
    }


    this.selectedDate =
      value.substring(0, 10);

  }


  addActivity(): void {

    console.log(
      'Nueva actividad:',
      this.selectedDate
    );

  }

}