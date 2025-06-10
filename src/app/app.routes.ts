// frontend/src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard'; // <--- VERIFIQUE ESTE CAMINHO!

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth-page/auth-page.page').then(m => m.AuthPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-page/register-page.page').then(m => m.RegisterPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];