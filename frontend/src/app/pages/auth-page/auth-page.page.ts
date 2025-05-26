// frontend/src/app/pages/auth-page/auth-page.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

// Importe o componente de cabeçalho
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AuthService } from '../../services/auth/auth.service'; // AGORA DESCOMENTADO

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.page.html',
  styleUrls: ['./auth-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule, // Certifique-se de que IonicModule está aqui se você usa componentes Ionic no HTML
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
    private authService: AuthService // AGORA DESCOMENTADO E INJETADO
  ) {}

  ngOnInit() {
    // Opcional: Redirecionar se o usuário já estiver autenticado
    this.authService.isAuthenticated.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    });
  }

  async login() {
    // Validação de campos
    if (!this.email || !this.password) {
      await this.presentAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Entrando...', });
    await loading.present();

    // Lógica de login AGORA USANDO AuthService
    this.authService.login(this.email, this.password).subscribe({
      next: async (success) => {
        await loading.dismiss();
        if (success) {
          await this.presentAlert('Sucesso', 'Login realizado com sucesso!');
          this.router.navigateByUrl('/home', { replaceUrl: true }); // Redireciona para a página principal do app
        } else {
          // O AuthService já deve lidar com erros e retornar false, mas aqui é um fallback
          await this.presentAlert('Erro', 'E-mail ou senha incorretos. Tente novamente.');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Erro no login:', err);
        // Firebase Auth retorna erros específicos, você pode refinar a mensagem aqui
        let errorMessage = 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          errorMessage = 'E-mail ou senha incorretos.';
        } else if (err.code === 'auth/invalid-email') {
          errorMessage = 'O formato do e-mail é inválido.';
        }
        await this.presentAlert('Erro', errorMessage);
      }
    });
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