import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  email = '';
  password = '';
  rememberMe = false;

  showPassword = false;
  formSubmitted = false;
  loading = false;

  constructor(
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('futgol-email');

    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async login(): Promise<void> {
    this.formSubmitted = true;

    // Validación básica
    if (!this.email || !this.password || this.password.length < 6) {
      await this.showToast(
        'Completá correctamente el correo y la contraseña.',
        'danger'
      );

      return;
    }

    this.loading = true;

    // Usuario temporal para probar la aplicación
    const validEmail = 'admin@futgol.com';
    const validPassword = '123456';

    setTimeout(async () => {
      if (
        this.email.trim().toLowerCase() === validEmail &&
        this.password === validPassword
      ) {
        if (this.rememberMe) {
          localStorage.setItem('futgol-email', this.email);
        } else {
          localStorage.removeItem('futgol-email');
        }

        localStorage.setItem('futgol-session', 'true');

        await this.router.navigateByUrl('/app/home', {
          replaceUrl: true
        });
      } else {
        await this.showToast(
          'Correo o contraseña incorrectos.',
          'danger'
        );
      }

      this.loading = false;
    }, 700);
  }

  async forgotPassword(): Promise<void> {
    await this.showToast(
      'La recuperación de contraseña estará disponible próximamente.',
      'medium'
    );
  }

  private async showToast(
    message: string,
    color: string
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color
    });

    await toast.present();
  }
}