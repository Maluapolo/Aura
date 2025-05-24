// frontend/src/app/pages/forgot-password/forgot-password.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

import { AppHeaderComponent } from '../../components/app-header/app-header.component'; // Importe o AppHeaderComponent

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppHeaderComponent // Adicione AppHeaderComponent aos imports
  ],
})
export class ForgotPassword implements OnInit {
  email: string = '';

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  async resetPassword() {
    if (!this.email) {
      await this.presentAlert('Erro', 'Por favor, digite seu e-mail.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando e-mail de recuperação...',
    });
    await loading.present();

    setTimeout(async () => {
      await loading.dismiss();
      console.log('E-mail para recuperação:', this.email);

      await this.presentAlert('Sucesso', 'Um e-mail com instruções para trocar sua senha foi enviado para ' + this.email);
      this.router.navigateByUrl('/auth');
    }, 2000);
  }

  async goToLogin() {
    this.router.navigateByUrl('/auth');
  }

  // O botão de fechar agora pode levar de volta para a tela de login
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