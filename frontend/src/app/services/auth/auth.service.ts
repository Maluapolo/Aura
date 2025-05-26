// frontend/src/app/services/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError, take } from 'rxjs/operators';

// Importações do Firebase Authentication - Sem getAuth aqui
import {
  Auth, // <--- Importe APENAS o tipo Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile
} from '@angular/fire/auth'; // <--- O IMPORTADOR DEVE SER @angular/fire/auth

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _currentUser = new BehaviorSubject<User | null>(null);

  isAuthenticated: Observable<boolean> = this._isAuthenticated.asObservable();
  currentUser: Observable<User | null> = this._currentUser.asObservable();

  // CONSTRUTOR COM INJEÇÃO DE 'Auth'
  // O Angular irá fornecer a instância 'Auth' para você
  constructor(private router: Router, private auth: Auth) { // <--- AQUI ESTÁ A CORREÇÃO CRÍTICA
    // Não precisamos chamar getAuth() aqui. O Angular já injetou a instância 'auth'.

    // O restante do código é o mesmo
    onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        };
        this._isAuthenticated.next(true);
        this._currentUser.next(user);
      } else {
        this._isAuthenticated.next(false);
        this._currentUser.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(userCredential => {
        this.router.navigateByUrl('/home', { replaceUrl: true });
        return true;
      }),
      catchError((error: any) => {
        console.error('Erro no login Firebase:', error);
        throw error;
      })
    );
  }

  register(fullName: string, email: string, password: string): Observable<boolean> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential) => {
        if (userCredential.user) {
          updateProfile(userCredential.user, { displayName: fullName })
            .catch(profileError => console.error('Erro ao atualizar perfil:', profileError));
        }

        this.router.navigateByUrl('/home', { replaceUrl: true });
        return true;
      }),
      catchError((error: any) => {
        console.error('Erro no cadastro Firebase:', error);
        throw error;
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigateByUrl('/auth', { replaceUrl: true });
    } catch (error: any) {
      console.error('Erro no logout Firebase:', error);
      throw error;
    }
  }

  isUserLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.pipe(take(1));
  }
}