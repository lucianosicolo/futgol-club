import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { ResponsableHomePage } from './responsable-home.page';

describe('ResponsableHomePage', () => {
  let component: ResponsableHomePage;
  let fixture: ComponentFixture<ResponsableHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsableHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
