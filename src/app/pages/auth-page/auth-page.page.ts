// frontend/src/app/pages/auth-page/auth-page.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.page.html',
  styleUrls: ['./auth-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppHeaderComponent,
    RouterModule
  ],
})
export class AuthPage implements OnInit {
  email: string = '';
  password: string = '';
  passwordVisible: boolean = false; // <--- Certifique-se que esta propriedade est\u00E1 aqui e inicializada como false

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    });
  }

  async login() {
    if (!this.email || !this.password) {
      await this.presentAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Entrando...', });
    await loading.present();

    this.authService.login(this.email, this.password).subscribe({
      next: async (success) => {
        await loading.dismiss();
        if (success) {
          await this.presentAlert('Sucesso', 'Login realizado com sucesso!');
        } else {
          await this.presentAlert('Erro', 'E-mail ou senha incorretos. Tente novamente.');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Erro no login:', err);
        let errorMessage = 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          errorMessage = 'E-mail ou senha incorretos.';
        } else if (err.code === 'auth/invalid-email') {
          errorMessage = 'O formato do e-mail \u00E9 inv\u00E1lido.';
        }
        await this.presentAlert('Erro', errorMessage);
      }
    });
  }

  async createAccount() {
    this.router.navigateByUrl('/register');
    console.log('Redirecionando para a p\u00E1gina de registro');
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  togglePasswordVisibility() { // <--- Certifique-se que este m\u00E9todo est\u00E1 aqui
    this.passwordVisible = !this.passwordVisible;
  }
}
