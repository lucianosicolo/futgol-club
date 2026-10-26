import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CalendarioPage } from './calendario.page';

describe('CalendarioPage', () => {
  let component: CalendarioPage;
  let http: jasmine.SpyObj<HttpClient>;
  let toastController: jasmine.SpyObj<ToastController>;
  let alertController: jasmine.SpyObj<AlertController>;

  const activity = {
    id: 'event-1',
    date: '2026-10-26',
    time: '18:00',
    duration_minutes: 90,
    title: 'Entrenamiento',
    type: 'training' as const,
    category: { id: 'category-1', name: 'Sub 15', active: true },
    location: 'Cancha principal',
    opponent: null,
    created_by: { id: 'teacher-1', name: 'Profe', last_name: 'Uno' },
  };

  beforeEach(() => {
    http = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    http.get.and.returnValue(of({ ok: true, result: [] }) as any);
    http.post.and.returnValue(of({ ok: true, result: activity }) as any);
    http.patch.and.returnValue(of({ ok: true, result: activity }) as any);
    http.delete.and.returnValue(of({ ok: true, result: activity }) as any);

    const toast = { present: jasmine.createSpy('present') };
    toastController = jasmine.createSpyObj('ToastController', ['create']);
    toastController.create.and.returnValue(Promise.resolve(toast as any));

    const alert = { present: jasmine.createSpy('present') };
    alertController = jasmine.createSpyObj('AlertController', ['create']);
    alertController.create.and.returnValue(Promise.resolve(alert as any));

    component = new CalendarioPage(http, toastController, alertController);
    component.selectedDate = '2026-10-26';
  });

  it('formats activity durations for minutes and hours', () => {
    expect(component.durationLabel(45)).toBe('45 min');
    expect(component.durationLabel(60)).toBe('1 h');
    expect(component.durationLabel(90)).toBe('1 h 30 min');
  });

  it('shows the right label for each activity type', () => {
    expect(component.typeLabel('training')).toBe('Entrenamiento');
    expect(component.typeLabel('match')).toBe('Partido');
    expect(component.typeLabel('general')).toBe('Actividad');
  });

  it('loads categories and activities for the selected date', () => {
    http.get.and.returnValues(
      of({ ok: true, result: [{ id: 'category-1', name: 'Sub 15', active: true }] }) as any,
      of({ ok: true, result: [activity] }) as any,
    );

    component.ngOnInit();

    expect(http.get.calls.argsFor(0)[0]).toBe(`${environment.apiUrl}/categories?active=true`);
    expect(http.get.calls.argsFor(1)[0]).toBe(
      `${environment.apiUrl}/calendar-events?date=2026-10-26`,
    );
    expect(component.categories.length).toBe(1);
    expect(component.activities).toEqual([activity]);
    expect(component.loading).toBeFalse();
  });

  it('ignores an invalid date selection', () => {
    component.selectDate({ detail: { value: null } } as any);

    expect(component.selectedDate).toBe('2026-10-26');
    expect(http.get).not.toHaveBeenCalled();
  });

  it('changes date, closes the editor and resets it before loading events', () => {
    component.editActivity(activity);

    component.selectDate({ detail: { value: '2026-10-27T00:00:00' } } as any);

    expect(component.selectedDate).toBe('2026-10-27');
    expect(component.showForm).toBeFalse();
    expect(component.editingId).toBeNull();
    expect(component.newTitle).toBe('Entrenamiento');
    expect(http.get).toHaveBeenCalledWith(
      `${environment.apiUrl}/calendar-events?date=2026-10-27`,
    );
  });

  it('updates the suggested title when the activity type changes', () => {
    component.newTitle = 'Entrenamiento';
    component.newType = 'match';
    component.changeType();
    expect(component.newTitle).toBe('Partido');

    component.newType = 'general';
    component.changeType();
    expect(component.newTitle).toBe('Actividad');
  });

  it('prefills the editor and clears fields missing from an event', () => {
    component.editActivity({ ...activity, category: null, location: null, opponent: null });

    expect(component.editingId).toBe('event-1');
    expect(component.showForm).toBeTrue();
    expect(component.newTitle).toBe('Entrenamiento');
    expect(component.newCategoryId).toBe('');
    expect(component.newLocation).toBe('');
    expect(component.newOpponent).toBe('');
  });

  it('does not send an activity with a blank title or invalid duration', () => {
    component.newTitle = '   ';
    component.createActivity();
    expect(http.post).not.toHaveBeenCalled();

    component.newTitle = 'Partido';
    component.newDurationMinutes = 601;
    component.createActivity();
    expect(http.post).not.toHaveBeenCalled();
    expect(component.saving).toBeFalse();
  });

  it('creates an activity with trimmed optional fields and the selected date', () => {
    component.newTitle = '  Partido del sábado  ';
    component.newType = 'match';
    component.newTime = '10:00';
    component.newDurationMinutes = 90;
    component.newCategoryId = 'category-1';
    component.newLocation = '  Cancha principal  ';
    component.newOpponent = '  Racing  ';

    component.createActivity();

    expect(http.post).toHaveBeenCalledWith(
      `${environment.apiUrl}/calendar-events`,
      {
        title: 'Partido del sábado',
        type: 'match',
        date: '2026-10-26',
        time: '10:00',
        duration_minutes: 90,
        categoryId: 'category-1',
        location: 'Cancha principal',
        opponent: 'Racing',
      },
    );
    expect(component.saving).toBeFalse();
    expect(component.showForm).toBeFalse();
    expect(component.editingId).toBeNull();
  });

  it('updates an existing activity instead of creating a new one', () => {
    component.editActivity(activity);
    component.newTitle = 'Entrenamiento actualizado';

    component.createActivity();

    expect(http.patch).toHaveBeenCalledWith(
      `${environment.apiUrl}/calendar-events/event-1`,
      jasmine.objectContaining({ title: 'Entrenamiento actualizado' }),
    );
    expect(http.post).not.toHaveBeenCalled();
  });

  it('clears the saving state and shows the API error when saving fails', () => {
    http.post.and.returnValue(
      throwError(() => ({ error: { message: 'No autorizado' } })) as any,
    );

    component.createActivity();

    expect(component.saving).toBeFalse();
    expect(toastController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ message: 'No autorizado', color: 'danger' }),
    );
  });

  it('waits for confirmation before deleting an activity', async () => {
    await component.deleteActivity(activity);

    expect(alertController.create).toHaveBeenCalled();
    expect(alertController.create.calls.mostRecent().args[0]!.header).toBe(
      'Eliminar actividad',
    );
    expect(http.delete).not.toHaveBeenCalled();

    const buttons = alertController.create.calls.mostRecent().args[0]!.buttons as any[];
    buttons[1].handler();

    expect(http.delete).toHaveBeenCalledWith(
      `${environment.apiUrl}/calendar-events/event-1`,
    );
  });
});
