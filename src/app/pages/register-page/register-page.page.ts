// frontend/src/app/pages/register-page/register-page.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertController, LoadingController, IonicModule } from '@ionic/angular';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.page.html',
  styleUrls: ['./register-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppHeaderComponent,
    RouterModule,
    IonicModule
  ],
})
export class RegisterPage implements OnInit {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeTerms: boolean = false;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    });
  }

  async register() {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      await this.presentAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.presentAlert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (!this.agreeTerms) {
      await this.presentAlert('Erro', 'Você deve concordar com os Termos de privacidade.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Criando conta...',
    });
    await loading.present();

    this.authService.register(this.fullName, this.email, this.password).subscribe({
      next: async (success) => {
        await loading.dismiss();
        if (success) {
          await this.presentAlert('Sucesso', 'Sua conta foi criada com sucesso!');
          this.router.navigateByUrl('/home', { replaceUrl: true });
        } else {
          await this.presentAlert('Falha no Registro', 'Não foi possível criar sua conta. Tente novamente.');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Erro no registro Firebase:', err);
        let errorMessage = 'Ocorreu um erro ao tentar criar sua conta. Por favor, tente novamente.';
        if (err.code === 'auth/email-already-in-use') {
          errorMessage = 'Este e-mail já está em uso. Por favor, use outro e-mail.';
        } else if (err.code === 'auth/weak-password') {
          errorMessage = 'A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.';
        } else if (err.code === 'auth/invalid-email') {
          errorMessage = 'O formato do e-mail é inválido.';
        }
        await this.presentAlert('Erro', errorMessage);
      }
    });
  }

  async goToLogin() {
    this.router.navigateByUrl('/auth');
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}