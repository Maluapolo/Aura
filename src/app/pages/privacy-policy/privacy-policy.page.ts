// frontend/src/app/pages/privacy-policy/privacy-policy.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importe Router

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
  standalone: true,
  imports: [
    CommonModule
  ],
})
export class PrivacyPolicyPage implements OnInit {
  lastUpdatedDate: string = '';

  constructor(private router: Router) { } // Injete Router

  ngOnInit() {
    // Define a data da \u00FAltima atualiza\u00E7\u00E3o para ser exibida no HTML
    const date = new Date();
    this.lastUpdatedDate = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // M\u00E9todo para voltar \u00E0 p\u00E1gina anterior (ou para uma rota espec\u00EDfica)
  goBack() {
    // Op\u00E7\u00E3o 1: Voltar para a p\u00E1gina anterior no hist\u00F3rico do navegador
    window.history.back();

    // Op\u00E7\u00E3o 2: Navegar para uma rota espec\u00EDfica (ex: p\u00E1gina de registro)
    // this.router.navigateByUrl('/register');
  }
}
