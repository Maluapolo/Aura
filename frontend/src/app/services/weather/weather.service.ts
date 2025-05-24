import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private backendUrl = 'http://localhost:3000/api/weather'; // URL do seu backend Node.js

  constructor(private http: HttpClient) { }

  getWeatherByCity(city: string): Observable<any> {
    return this.http.get(`<span class="math-inline">\{this\.backendUrl\}/</span>{city}`);
  }

  getWeatherByCoords(lat: number, lon: number): Observable<any> {
    return this.http.get(`<span class="math-inline">\{this\.backendUrl\}/coords/</span>{lat}/${lon}`);
  }
}