// frontend/src/app/pages/history/history.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Adicione RouterModule
import { Subscription } from 'rxjs'; // Para gerenciar a inscri\u00E7\u00E3o do Observable

import { SearchService } from '../../services/search/search.service';
import { AuthService } from '../../services/auth/auth.service'; // Para obter o userId
// import { AppHeaderComponent } from '../../components/app-header/app-header.component'; // Se for usar o AppHeader

// Interface para um item do hist\u00F3rico de busca (duplicada do SearchService para clareza)
interface SearchHistoryItem {
  city: string;
  timestamp: Date; // Usamos Date aqui, j\u00E1 que ser\u00E1 convertido no servi\u00E7o
}

// Interface para um item de cidade popular (duplicada do SearchService para clareza)
interface PopularCity {
  name: string;
  count: number;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // Importe RouterModule para usar routerLink
    // AppHeaderComponent // Inclua o AppHeaderComponent se estiver usando
  ],
})
export class HistoryPage implements OnInit, OnDestroy {
  userSearchHistory: SearchHistoryItem[] = [];
  popularCities: PopularCity[] = [];
  isLoadingHistory: boolean = true;
  isLoadingPopular: boolean = true;
  historyError: string | null = null;
  popularError: string | null = null;
  currentUserId: string | null = null;

  private historySubscription: Subscription | undefined;
  private popularSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined; // Para observar o authState

  constructor(
    private searchService: SearchService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.loadSearchHistory();
        this.loadPopularCities();
      } else {
        // Usu\u00E1rio deslogado ou n\u00E3o autenticado
        this.currentUserId = null;
        this.userSearchHistory = [];
        this.popularCities = [];
        this.isLoadingHistory = false;
        this.isLoadingPopular = false;
        this.historyError = 'Fa\u00E7a login para ver seu hist\u00F3rico.';
      }
    });
  }

  ngOnDestroy() {
    // Desinscreve-se dos Observables para evitar vazamento de mem\u00F3ria
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
    if (this.popularSubscription) {
      this.popularSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadSearchHistory() {
    this.isLoadingHistory = true;
    this.historyError = null;
    this.historySubscription = this.searchService.getSearchHistory().subscribe({
      next: (data) => {
        this.userSearchHistory = data;
        this.isLoadingHistory = false;
        console.log('Hist\u00F3rico de busca carregado:', this.userSearchHistory);
      },
      error: (err) => {
        console.error('Erro ao carregar hist\u00F3rico de busca:', err);
        this.historyError = 'N\u00E3o foi poss\u00EDvel carregar seu hist\u00F3rico de busca.';
        this.isLoadingHistory = false;
      }
    });
  }

  loadPopularCities() {
    this.isLoadingPopular = true;
    this.popularError = null;
    this.popularSubscription = this.searchService.getPopularCities().subscribe({
      next: (data) => {
        this.popularCities = data;
        this.isLoadingPopular = false;
        console.log('Cidades populares carregadas:', this.popularCities);
      },
      error: (err) => {
        console.error('Erro ao carregar cidades populares:', err);
        this.popularError = 'N\u00E3o foi poss\u00EDvel carregar as cidades populares.';
        this.isLoadingPopular = false;
      }
    });
  }

  async clearHistory() {
    // Substitua 'confirm' por um modal customizado se n\u00E3o estiver usando Ionic
    const confirmClear = window.confirm('Tem certeza que deseja limpar todo o seu hist\u00F3rico de busca?');
    if (confirmClear) {
      this.isLoadingHistory = true;
      try {
        await this.searchService.clearSearchHistory();
        console.log('Hist\u00F3rico limpo.');
        // A UI ser\u00E1 atualizada automaticamente via onSnapshot
      } catch (error) {
        console.error('Erro ao limpar hist\u00F3rico:', error);
        this.historyError = 'Falha ao limpar o hist\u00F3rico.';
      } finally {
        this.isLoadingHistory = false;
      }
    }
  }

  // M\u00E9todo para buscar clima de uma cidade do hist\u00F3rico/popular
  searchCityFromList(city: string) {
    // Navega de volta para a Home e passa a cidade como um query parameter
    this.router.navigate(['/home'], { queryParams: { city: city } });
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }
}
