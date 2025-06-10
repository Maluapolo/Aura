// frontend/src/app/services/search/search.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot,
  increment,
  deleteDoc,
  orderBy // <--- ADICIONADO: Importe orderBy
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Auth, authState } from '@angular/fire/auth';

// Declare a vari\u00E1vel global __app_id para o TypeScript reconhecer
declare const __app_id: string;

// Interface para um item do hist\u00F3rico de busca
interface SearchHistoryItem {
  city: string;
  timestamp: any; // Firebase Timestamp
}

// Interface para um item de cidade popular
interface PopularCity {
  name: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private firestore: Firestore, private auth: Auth) {}

  // =========================================================
  // M\u00E9todos para Hist\u00F3rico de Busca do Usu\u00E1rio (Privado)
  // Cole\u00E7\u00E3o: /artifacts/{appId}/users/{userId}/searchHistory
  // =========================================================

  /**
   * Adiciona uma cidade ao hist\u00F3rico de busca do usu\u00E1rio atual.
   * Limita o hist\u00F3rico para manter apenas as 10 buscas mais recentes.
   * @param city O nome da cidade a ser adicionada.
   */
  async addSearchToHistory(city: string): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      console.warn('N\u00E3o h\u00E1 usu\u00E1rio logado para adicionar ao hist\u00F3rico de busca.');
      return;
    }

    // Acessa o appId global fornecido pelo ambiente Canvas
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const userHistoryRef = collection(this.firestore, `artifacts/${appId}/users/${userId}/searchHistory`);

    // Primeiro, verifica se a cidade j\u00E3s est\u00E1 no hist\u00F3rico para evitar duplicatas recentes
    const q = query(userHistoryRef, where('city', '==', city));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Se a cidade j\u00E1 existe, apenas atualiza o timestamp para mov\u00EA-la para o topo
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { timestamp: serverTimestamp() });
      console.log(`Hist\u00F3rico de busca para "${city}" atualizado.`);
    } else {
      // Se a cidade n\u00E3o existe, adiciona um novo documento
      const newDocRef = doc(userHistoryRef);
      await setDoc(newDocRef, {
        city: city,
        timestamp: serverTimestamp()
      });
      console.log(`"${city}" adicionado ao hist\u00F3rico de busca.`);
    }

    // Limpa hist\u00F3rico: mant\u00E9m apenas os 10 mais recentes
    const historyQuery = query(userHistoryRef, orderBy('timestamp', 'desc'));
    const allHistorySnapshot = await getDocs(historyQuery);
    if (allHistorySnapshot.docs.length > 10) {
      const docsToDelete = allHistorySnapshot.docs.slice(10);
      const deletePromises = docsToDelete.map(docToDelete => deleteDoc(docToDelete.ref));
      await Promise.all(deletePromises);
      console.log(`Limpeza do hist\u00F3rico: ${docsToDelete.length} itens removidos.`);
    }
  }

  /**
   * Retorna o hist\u00F3rico de busca do usu\u00E1rio atual em tempo real.
   * @returns Observable de um array de SearchHistoryItem.
   */
  getSearchHistory(): Observable<SearchHistoryItem[]> {
    return from(authState(this.auth)).pipe(
      switchMap(user => {
        if (!user) {
          console.log('Nenhum usu\u00E1rio logado, retornando hist\u00F3rico vazio.');
          return of([]);
        }
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const userHistoryRef = collection(this.firestore, `artifacts/${appId}/users/${user.uid}/searchHistory`);
        const q = query(userHistoryRef, orderBy('timestamp', 'desc'), limit(10));

        return new Observable<SearchHistoryItem[]>(observer => {
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const history: SearchHistoryItem[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                city: data['city'],
                timestamp: data['timestamp']?.toDate()
              };
            });
            observer.next(history);
          }, (error) => {
            console.error('Erro ao buscar hist\u00F3rico de busca em tempo real:', error);
            observer.error(error);
          });

          // Retorna a fun\u00E7\u00E3o de unsubscribe quando o Observable \u00E9 desinscrito
          return () => unsubscribe();
        });
      }),
      catchError(error => {
        console.error('Erro na autentica\u00E7\u00E3o para hist\u00F3rico de busca:', error);
        return of([]);
      })
    );
  }

  /**
   * Limpa o hist\u00F3rico de busca do usu\u00E1rio atual.
   */
  async clearSearchHistory(): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      console.warn('N\u00E3o h\u00E1 usu\u00E1rio logado para limpar o hist\u00F3rico de busca.');
      return;
    }
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const userHistoryRef = collection(this.firestore, `artifacts/${appId}/users/${userId}/searchHistory`);

    // Pega todos os documentos do hist\u00F3rico do usu\u00E1rio
    const q = query(userHistoryRef);
    const snapshot = await getDocs(q);

    // Exclui cada documento
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('Hist\u00F3rico de busca limpo com sucesso.');
  }

  // =========================================================
  // M\u00E9todos para Cidades Populares (P\u00FAblico)
  // Cole\u00E7\u00E3o: /artifacts/{appId}/public/data/popularCities
  // =========================================================

  /**
   * Incrementa a contagem de uma cidade nas cidades populares.
   * Se a cidade n\u00E3o existir, ela ser\u00E1 criada com count = 1.
   * @param city O nome da cidade a ser incrementada.
   */
  async incrementPopularCity(city: string): Promise<void> {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const popularCitiesRef = collection(this.firestore, `artifacts/${appId}/public/data/popularCities`);
    const cityDocRef = doc(popularCitiesRef, city.toLowerCase());

    try {
      await setDoc(cityDocRef, {
        name: city,
        count: increment(1)
      }, { merge: true });
      console.log(`Contador para "${city}" incrementado.`);
    } catch (error) {
      console.error(`Erro ao incrementar contador para "${city}":`, error);
    }
  }

  /**
   * Retorna a lista de cidades populares em tempo real.
   * @returns Observable de um array de PopularCity.
   */
  getPopularCities(): Observable<PopularCity[]> {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const popularCitiesRef = collection(this.firestore, `artifacts/${appId}/public/data/popularCities`);
    // Ordena por 'count' em ordem decrescente e limita aos 10 mais populares
    const q = query(popularCitiesRef, orderBy('count', 'desc'), limit(10));

    return new Observable<PopularCity[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const popularCities: PopularCity[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data['name'],
            count: data['count']
          };
        });
        observer.next(popularCities);
      }, (error) => {
        console.error('Erro ao buscar cidades populares em tempo real:', error);
        observer.error(error);
      });

      // Retorna a fun\u00E7\u00E3o de unsubscribe quando o Observable \u00E9 desinscrito
      return () => unsubscribe();
    });
  }
}
