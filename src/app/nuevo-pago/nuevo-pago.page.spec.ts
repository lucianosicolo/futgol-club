import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoPagoPage } from './nuevo-pago.page';

describe('NuevoPagoPage', () => {
  let component: NuevoPagoPage;
  let fixture: ComponentFixture<NuevoPagoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoPagoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
