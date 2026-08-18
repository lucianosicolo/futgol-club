import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
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
