// frontend/src/app/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service'; // <--- VERIFIQUE ESTE CAMINHO! (Pode ser ../services/auth.service se não tiver subpasta 'auth')
import { take, map } from 'rxjs/operators'; // Importe take e map

@Injectable({
  providedIn: 'root' // Isso torna o guard um singleton e injetável em toda a aplicação
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // O guard se inscreve no estado de autenticação do AuthService
    return this.authService.isAuthenticated.pipe(
      take(1), // Garante que pegamos o valor atual e nos desinscrevemos, evitando loops infinitos
      map(isAuth => {
        if (isAuth) {
          // Se o usuário estiver autenticado, permite o acesso à rota
          return true;
        } else {
          // Se o usuário NÃO estiver autenticado, redireciona para a página de login
          // createUrlTree permite criar uma URL e o router navegar para ela
          return this.router.createUrlTree(['/auth']);
        }
      })
    );
  }
}