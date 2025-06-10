import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header', // Seletor para usar este componente em outros lugares (<app-header></app-header>)
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true, // Define como um componente standalone
  imports: [CommonModule], // Importa módulos necessários para este componente
})
export class AppHeaderComponent {}