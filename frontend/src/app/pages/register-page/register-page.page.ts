// frontend/src/app/pages/register-page/register-page.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
// REMOVIDO: import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.page.html',
  styleUrls: ['./register-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppHeaderComponent,
    RouterModule
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
    // REMOVIDO: private authService: AuthService
  ) {}

  ngOnInit() {
    // REMOVIDO: Lógica de redirecionamento baseada no AuthService
    // this.authService.isAuthenticated.subscribe(isAuth => {
    //   if (isAuth) {
    //     this.router.navigateByUrl('/home', { replaceUrl: true });
    //   }
    // });
  }

  async register() {
    // Validações básicas
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

    // Lógica de cadastro SIMULADA (como estava antes)
    setTimeout(async () => {
      await loading.dismiss();
      console.log('Dados de Registro:', {
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        agreeTerms: this.agreeTerms
      });

      await this.presentAlert('Sucesso', 'Sua conta foi criada com sucesso!');
      this.router.navigateByUrl('/auth'); // Redireciona para a página de login
    }, 2000);
  }

  async goToLogin() {
    this.router.navigateByUrl('/auth'); // Navega para a página de login
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
