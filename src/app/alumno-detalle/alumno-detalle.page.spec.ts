import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AlumnoDetallePage } from './alumno-detalle.page';

describe('AlumnoDetallePage', () => {
  let component: AlumnoDetallePage;
  let fixture: ComponentFixture<AlumnoDetallePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlumnoDetallePage],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(AlumnoDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
