// frontend/src/app/services/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError, take, concatMap } from 'rxjs/operators';

// Importações do Firebase Authentication
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail // <--- ESTA IMPORTAÇÃO É CRUCIAL!
} from '@angular/fire/auth';

// Importações do Firestore
import {
  Firestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from '@angular/fire/firestore';

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

  constructor(private router: Router, private auth: Auth, private firestore: Firestore) {
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

  getCurrentUserDisplayName(): string | null {
    return this._currentUser.value?.displayName || null;
  }

  // MÉTODO sendPasswordResetEmail: PRECISA ESTAR AQUI!
  async sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
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
      concatMap(async (userCredential) => {
        const user = userCredential.user;

        if (user) {
          await updateProfile(user, { displayName: fullName })
            .catch(profileError => console.error('Erro ao atualizar perfil (Auth):', profileError));

          const usersCollection = collection(this.firestore, 'users');
          const userDocRef = doc(usersCollection, user.uid);

          const userData = {
            uid: user.uid,
            email: user.email,
            fullName: fullName,
            createdAt: serverTimestamp()
          };

          try {
            await setDoc(userDocRef, userData);
            console.log('Dados do usuário salvos no Firestore com sucesso!', userData);
          } catch (firestoreError) {
            console.error('Erro ao salvar dados do usuário no Firestore:', firestoreError);
          }
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