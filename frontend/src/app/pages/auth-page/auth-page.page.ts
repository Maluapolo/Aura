// frontend/src/app/pages/auth-page/auth-page.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

// Importe o componente de cabeçalho
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
// REMOVIDO: import { AuthService } from '../../services/auth/auth.service';

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

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
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

  async login() {
    // Validação de campos
    if (!this.email || !this.password) {
      await this.presentAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Entrando...', });
    await loading.present();

    // Lógica de login SIMULADA (como estava antes)
    setTimeout(async () => {
      await loading.dismiss();
      if (this.email === 'teste@aura.com' && this.password === '123456') {
        await this.presentAlert('Sucesso', 'Login realizado com sucesso!');
        this.router.navigateByUrl('/home'); // Redireciona para a página principal do app
      } else {
        await this.presentAlert('Erro', 'E-mail ou senha incorretos.');
      }
    }, 1500);
  }

  async createAccount() {
    // Redirecionar para a página de registro
    this.router.navigateByUrl('/register');
    console.log('Redirecionando para a página de registro');
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
