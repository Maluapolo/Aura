// frontend/src/app/guards/auth/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAuthenticated.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          return this.router.createUrlTree(['/auth']);
        }
      })
    );
  }
}