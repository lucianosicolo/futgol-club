import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
interface LoggedUser {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})

export class AppComponent {
   constructor(
    private router: Router,
    private menuController: MenuController
  ) {}
get user():
  LoggedUser | null {

  const storedUser =
    localStorage.getItem(
      'futgol-user',
    );

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser,
    );
  } catch {
    return null;
  }
}


get isAdmin(): boolean {
  return (
    this.user?.role ===
    'admin'
  );
}


get isTeacher(): boolean {
  return (
    this.user?.role ===
    'teacher'
  );
}


get isResponsible(): boolean {
  return (
    this.user?.role ===
    'responsible'
  );
}


get roleLabel(): string {

  switch (
    this.user?.role
  ) {

    case 'admin':
      return 'Administrador';

    case 'teacher':
      return 'Profesor';

    case 'responsible':
      return 'Responsable';

    default:
      return '';

  }

}
  async logout(): Promise<void> {

    // Cuando tengas login real, acá eliminamos el token
    localStorage.removeItem('futgol-token');

    await this.menuController.close();

    await this.router.navigateByUrl(
      '/login',
      { replaceUrl: true }
    );

  }
  
}
