// frontend/src/app/services/weather/weather.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Importe o environment

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private OPENWEATHER_API_KEY = environment.openWeatherApiKey; // Pega a chave do environment
  private CURRENT_WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  private FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  constructor(private http: HttpClient) {
    // Opcional: Adicionar um log para confirmar que a chave está sendo lida
    console.log('OpenWeatherMap API Key (frontend):', this.OPENWEATHER_API_KEY);
    if (!this.OPENWEATHER_API_KEY) {
      console.warn('ATENÇÃO: A chave da API OpenWeatherMap não foi definida em environment.ts!');
    }
  }

  // Obter clima atual por nome da cidade
  getWeatherByCity(city: string): Observable<any> {
    const url = `${this.CURRENT_WEATHER_BASE_URL}?q=${city}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    return this.http.get(url);
  }

  // Obter previsão de 5 dias por nome da cidade
  getWeatherForecastByCity(city: string): Observable<any> {
    const url = `${this.FORECAST_BASE_URL}?q=${city}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    return this.http.get(url);
  }

  // Obter clima atual por coordenadas
  getWeatherByCoords(lat: number, lon: number): Observable<any> {
    const url = `${this.CURRENT_WEATHER_BASE_URL}?lat=${lat}&lon=${lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    return this.http.get(url);
  }
}