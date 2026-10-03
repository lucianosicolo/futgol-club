import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionCuotasPage } from './gestion-cuotas.page';

describe('GestionCuotasPage', () => {
  let component: GestionCuotasPage;
  let fixture: ComponentFixture<GestionCuotasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionCuotasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
