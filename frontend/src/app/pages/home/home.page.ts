// frontend/src/app/pages/home/home.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; // Necessário para redirecionamento após logout

// Importa o componente de cabeçalho personalizado
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
// Importa o AuthService para gerenciar o estado de autenticação e o logout
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule, // Importe IonicModule se estiver usando componentes Ionic como ion-content, ion-button, etc.
    CommonModule,
    FormsModule,
    AppHeaderComponent // Inclui o componente de cabeçalho no template
  ],
})
export class HomePage implements OnInit {
  userEmail: string | null = null; // Propriedade para armazenar e exibir o e-mail do usuário

  constructor(
    private authService: AuthService, // Injeta o AuthService
    private router: Router // Injeta o Router
  ) {}

  ngOnInit() {
    // Se inscreve para receber atualizações do usuário logado do AuthService.
    // Isso garante que o userEmail seja atualizado quando o estado de autenticação mudar.
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.userEmail = user.email; // Atualiza userEmail com o e-mail do usuário logado
      } else {
        this.userEmail = null; // Limpa userEmail se o usuário deslogar
      }
    });
  }

  // Método chamado ao clicar no botão 'Sair'
  async logout() {
    await this.authService.logout(); // Chama o método de logout do AuthService
    // O AuthService já cuida do redirecionamento para a tela de login após o logout
  }
}