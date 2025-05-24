// frontend/src/app/services/auth/auth.service.ts

import { Injectable } from '@angular/core'; // REMOVA 'Inject' se estiver aqui
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError, take } from 'rxjs/operators';

// Importações do Firebase Authentication
import {
  Auth, // <--- O TIPO Auth AINDA É IMPORTADO PARA TIPAGEM
  getAuth, // <--- AGORA PRECISAMOS DE 'getAuth' PARA OBTER A INSTÂNCIA
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

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

  private auth: Auth; // <--- DECLARAMOS A PROPRIEDADE 'auth' AQUI

  // CONSTRUTOR SEM INJEÇÃO DE 'Auth'
  constructor(private router: Router) {
    // OBTEMOS A INSTÂNCIA DO AUTH DIRETAMENTE AQUI
    // Isso contorna o problema de injeção do Angular
    this.auth = getAuth();

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

  // O restante dos métodos (login, register, logout, isUserLoggedIn) permanecem os mesmos
  // pois eles já usam 'this.auth'

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