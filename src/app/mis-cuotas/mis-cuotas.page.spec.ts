import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisCuotasPage } from './mis-cuotas.page';

describe('MisCuotasPage', () => {
  let component: MisCuotasPage;
  let fixture: ComponentFixture<MisCuotasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisCuotasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
