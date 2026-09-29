import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoAlumnoPage } from './nuevo-alumno.page';

describe('NuevoAlumnoPage', () => {
  let component: NuevoAlumnoPage;
  let fixture: ComponentFixture<NuevoAlumnoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoAlumnoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
