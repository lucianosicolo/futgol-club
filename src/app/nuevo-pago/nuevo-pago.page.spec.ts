import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { NuevoPagoPage } from './nuevo-pago.page';

describe('NuevoPagoPage', () => {
  let component: NuevoPagoPage;
  let fixture: ComponentFixture<NuevoPagoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NuevoPagoPage],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(NuevoPagoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
