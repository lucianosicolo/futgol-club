import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministrativoPage } from './administrativo.page';

describe('AdministrativoPage', () => {
  let component: AdministrativoPage;
  let fixture: ComponentFixture<AdministrativoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrativoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
