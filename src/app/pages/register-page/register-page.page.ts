// frontend/src/app/pages/register-page/register-page.page.ts

import { Component, OnInit } from '@angular/core'; // Adicionado OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular'; // Inclu\u00EDdo IonicModule, AlertController, LoadingController
import { Router, RouterModule } from '@angular/router';

// Importe o componente de cabe\u00E7alho
import { AppHeaderComponent } from '../../components/app-header/app-header.component'; // Se voc\u00EA usa AppHeaderComponent
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.page.html',
  styleUrls: ['./register-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule, // Certifique-se de que IonicModule est\u00E1 aqui se voc\u00EA usa componentes Ionic no HTML
    CommonModule,
    FormsModule,
    AppHeaderComponent, // Adicione AppHeaderComponent aos imports se ele for um standalone component
    RouterModule
  ],
})
export class RegisterPage implements OnInit { // Implementado OnInit
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false; // Para o spinner do bot\u00E3o
  errorMessage: string | null = null; // Para mensagens de erro
  agreeTerms: boolean = false;
  passwordVisible: boolean = false; // NOVO: Controla a visibilidade da senha
  confirmPasswordVisible: boolean = false; // NOVO: Controla a visibilidade da confirma\u00E7\u00E3o de senha

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController, // Injetado
    private loadingCtrl: LoadingController // Injetado
  ) {}

  ngOnInit() {
    // Opcional: Redirecionar se o usu\u00E1rio j\u00E1 estiver autenticado
    this.authService.isAuthenticated.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    });
  }

  async register() {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.password !== this.confirmPassword) {
      await this.presentAlert('Erro', 'As senhas n\u00E3o coincidem.');
      this.isLoading = false;
      return;
    }

    if (!this.agreeTerms) {
      await this.presentAlert('Erro', 'Voc\u00EA precisa concordar com os Termos de privacidade.');
      this.isLoading = false;
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Registrando...', });
    await loading.present();

    try {
      this.authService.register(this.fullName, this.email, this.password).subscribe({
        next: async (success) => {
          await loading.dismiss();
          if (success) {
            await this.presentAlert('Sucesso', 'Cadastro realizado com sucesso!');
            this.router.navigateByUrl('/home', { replaceUrl: true }); // Redireciona para a p\u00E1gina principal do app
          } else {
            // O AuthService j\u00E1 deve lidar com erros e retornar false, mas aqui \u00E9 um fallback
            await this.presentAlert('Erro', 'Ocorreu um erro no cadastro. Tente novamente.');
          }
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Erro ao registrar:', err);
          let errorMessage = 'Ocorreu um erro no cadastro. Tente novamente.';
          switch (err.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'Este e-mail j\u00E1 est\u00E1 em uso.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'E-mail inv\u00E1lido.';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'O registro com e-mail/senha n\u00E3o est\u00E1 habilitado.';
              break;
            case 'auth/weak-password':
              errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
              break;
          }
          await this.presentAlert('Erro', errorMessage);
        }
      });
    } catch (error) {
      console.error('Erro inesperado na chamada de registro:', error);
      await loading.dismiss();
      await this.presentAlert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  }

  // NOVO: M\u00E9todo para alternar a visibilidade da senha principal
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // NOVO: M\u00E9todo para alternar a visibilidade da confirma\u00E7\u00E3o de senha
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  goToLogin() {
    this.router.navigateByUrl('/auth');
  }
}
