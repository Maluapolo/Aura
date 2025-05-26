// frontend/src/app/services/weather.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Certifique-se que Observable está importado

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  // Ajuste esta URL base para o endereço do seu backend Node.js
  private apiUrl = 'http://localhost:3000/api/weather'; // Exemplo: se seu backend roda na porta 3000

  constructor(private http: HttpClient) { }

  getWeatherByCity(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${city}`);
  }

  // NOVO: Método para obter a previsão do tempo de 5 dias
  getWeatherForecastByCity(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/forecast/${city}`);
  }

  getWeatherByCoords(lat: number, lon: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/coords/${lat}/${lon}`);
  }
}