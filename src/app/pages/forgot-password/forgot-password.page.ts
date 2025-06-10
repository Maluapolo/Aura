// frontend/src/app/pages/forgot-password/forgot-password.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, IonicModule } from '@ionic/angular'; // Mantenha IonicModule para AlertController e LoadingController

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AuthService } from '../../services/auth/auth.service'; // Importe o AuthService

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // Essencial para AlertController e LoadingController do Ionic
    AppHeaderComponent // Se você usa o AppHeaderComponent
  ],
})
export class ForgotPasswordPage implements OnInit { // Mantive o nome da classe 'ForgotPasswordPage' por convenção
  email: string = '';
  isLoading: boolean = false; // Propriedade para controlar o estado de carregamento do botão

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private authService: AuthService // Injete o AuthService
  ) {}

  ngOnInit() {
    // Se precisar de alguma lógica de inicialização aqui, adicione-a.
  }

  async resetPassword() {
    // Validação básica do e-mail
    if (!this.email || this.email.trim() === '') {
      await this.presentAlert('Erro', 'Por favor, digite seu e-mail.');
      return;
    }

    this.isLoading = true; // Ativa o estado de carregamento para desabilitar o botão e mostrar spinner
    const loading = await this.loadingCtrl.create({
      message: 'Enviando e-mail de redefinição...',
    });
    await loading.present(); // Exibe o indicador de carregamento

    try {
      // Chama o método real de redefinição de senha do Firebase através do AuthService
      await this.authService.sendPasswordResetEmail(this.email);

      await loading.dismiss(); // Esconde o indicador de carregamento
      await this.presentAlert('Sucesso', 'Um e-mail de redefinição de senha foi enviado para ' + this.email + '. Por favor, verifique sua caixa de entrada (e pasta de spam).');
      this.router.navigateByUrl('/auth', { replaceUrl: true }); // Redireciona de volta para a tela de login
    } catch (error: any) {
      await loading.dismiss(); // Esconde o indicador de carregamento
      console.error('Erro ao redefinir senha (Firebase):', error);

      // Trata erros específicos do Firebase Authentication
      let errorMessage = 'Ocorreu um erro ao enviar o e-mail de redefinição. Por favor, tente novamente.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nenhum usuário encontrado com este e-mail.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O formato do e-mail é inválido.';
      }
      await this.presentAlert('Erro', errorMessage);
    } finally {
      this.isLoading = false; // Desativa o estado de carregamento, mesmo em caso de erro
    }
  }

  async goToLogin() {
    this.router.navigateByUrl('/auth'); // Navega de volta para a tela de login
  }

  // Se você tiver um botão de fechar modal (que não está no HTML fornecido), esta função pode ser usada
  async closeModal() {
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