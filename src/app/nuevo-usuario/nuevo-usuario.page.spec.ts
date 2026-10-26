import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { NuevoUsuarioPage } from './nuevo-usuario.page';

describe('NuevoUsuarioPage', () => {
  let component: NuevoUsuarioPage;
  let fixture: ComponentFixture<NuevoUsuarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(NuevoUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
