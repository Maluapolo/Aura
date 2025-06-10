import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, setDoc, addDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface FavoriteLocation {
  id?: string; // Gerado automaticamente pelo Firestore
  name: string;
  latitude: number;
  longitude: number;
  // Adicione outras propriedades se desejar, como ícone, última consulta, etc.
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  // Adiciona uma localização favorita ao Firestore
  addFavoriteLocation(location: Omit<FavoriteLocation, 'id'>) {
    const locationsCollection = collection(this.firestore, 'favoriteLocations');
    return addDoc(locationsCollection, location);
  }

  // Obtém todas as localizações favoritas em tempo real
  getFavoriteLocations(): Observable<FavoriteLocation[]> {
    const locationsCollection = collection(this.firestore, 'favoriteLocations');
    // 'idField' é importante para incluir o ID do documento nos dados retornados
    return collectionData(locationsCollection, { idField: 'id' }) as Observable<FavoriteLocation[]>;
  }

  // Remove uma localização favorita
  deleteFavoriteLocation(id: string) {
    const locationDocRef = doc(this.firestore, `favoriteLocations/${id}`);
    return deleteDoc(locationDocRef);
  }
}