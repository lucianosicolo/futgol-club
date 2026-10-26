import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MisCuotasPage } from './mis-cuotas.page';

describe('MisCuotasPage', () => {
  let component: MisCuotasPage;
  let fixture: ComponentFixture<MisCuotasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisCuotasPage],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(MisCuotasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
