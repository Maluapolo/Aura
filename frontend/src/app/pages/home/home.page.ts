// frontend/src/app/pages/home/home.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Certifique-se que CommonModule está aqui
import { FormsModule } from '@angular/forms';   // Certifique-se que FormsModule está aqui
import { IonicModule, ToastController } from '@ionic/angular'; // <-- ADICIONADO IonicModule AQUI

import { AuthService } from '../../services/auth/auth.service';
import { WeatherService } from '../../services/weather/weather.service';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

// Opcional: Interface para tipar os dados da previsão diária
interface DailyForecast {
  name: string; // Ex: "Hoje", "Amanhã", "Sex."
  icon: string; // Ex: "04d"
  maxTemp: number;
  minTemp: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [ // <-- VERIFIQUE ESTA SEÇÃO
    IonicModule,      // <-- ESSENCIAL PARA COMPONENTES IONIC
    CommonModule,
    FormsModule       // <-- ESSENCIAL PARA [(ngModel)]
  ],
})
export class HomePage implements OnInit {
  currentUserDisplayName: string | null = null;
  city: string = '';
  weatherData: any | null = null;
  isLoadingWeather: boolean = false;
  weatherError: string | null = null;

  forecastData: DailyForecast[] | null = null;
  isLoadingForecast: boolean = false;
  forecastError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private weatherService: WeatherService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.currentUserDisplayName = this.authService.getCurrentUserDisplayName();
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true }); // Redireciona para /auth após logout
  }

  async getWeatherByCity() {
    if (!this.city) {
      this.presentToast('Por favor, digite o nome da cidade.');
      return;
    }

    this.isLoadingWeather = true;
    this.weatherError = null;
    this.weatherData = null;
    this.forecastData = null;

    try {
      this.weatherService.getWeatherByCity(this.city).subscribe({
        next: (data) => {
          this.weatherData = data;
          this.isLoadingWeather = false;
          this.getForecastData(this.city);
        },
        error: (err) => {
          console.error('Erro ao buscar clima atual:', err);
          this.weatherError = 'Não foi possível obter os dados do clima atual. Tente novamente.';
          this.isLoadingWeather = false;
          this.forecastData = null;
        }
      });
    } catch (error) {
      console.error('Erro inesperado ao iniciar busca de clima:', error);
      this.weatherError = 'Ocorreu um erro inesperado. Tente novamente.';
      this.isLoadingWeather = false;
    }
  }

  async getWeatherByCurrentLocation() {
    this.isLoadingWeather = true;
    this.weatherError = null;
    this.weatherData = null;
    this.forecastData = null;

    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const lat = coordinates.coords.latitude;
      const lon = coordinates.coords.longitude;

      this.weatherService.getWeatherByCoords(lat, lon).subscribe({
        next: (data) => {
          this.weatherData = data;
          this.isLoadingWeather = false;
          this.city = data.name;
          this.getForecastData(this.city);
        },
        error: (err) => {
          console.error('Erro ao buscar clima por coordenadas:', err);
          this.weatherError = 'Não foi possível obter os dados de clima pela sua localização. Verifique as permissões.';
          this.isLoadingWeather = false;
          this.forecastData = null;
        }
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      this.weatherError = 'Não foi possível obter sua localização. Verifique as permissões do dispositivo.';
      this.isLoadingWeather = false;
    }
  }

  private getForecastData(city: string) {
    this.isLoadingForecast = true;
    this.forecastError = null;

    this.weatherService.getWeatherForecastByCity(city).subscribe({
      next: (data) => {
        this.forecastData = this.processForecastData(data.list);
        this.isLoadingForecast = false;
      },
      error: (err) => {
        console.error('Erro ao buscar previsão:', err);
        this.forecastError = 'Não foi possível obter a previsão para os próximos dias.';
        this.isLoadingForecast = false;
        this.forecastData = null;
      }
    });
  }

  private processForecastData(forecastList: any[]): DailyForecast[] {
    const dailyData: { [key: string]: { temps: number[], icons: string[], date: Date } } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    forecastList.forEach(item => {
      const itemDate = new Date(item.dt * 1000);
      itemDate.setHours(0, 0, 0, 0);

      const dateKey = itemDate.toISOString().slice(0, 10);

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { temps: [], icons: [], date: itemDate };
      }
      dailyData[dateKey].temps.push(item.main.temp_max, item.main.temp_min);
      dailyData[dateKey].icons.push(item.weather[0].icon);
    });

    const processedForecast: DailyForecast[] = [];
    const sortedKeys = Object.keys(dailyData).sort();

    for (let i = 0; i < Math.min(3, sortedKeys.length); i++) {
      const key = sortedKeys[i];
      const dayEntry = dailyData[key];
      const maxTemp = Math.max(...dayEntry.temps);
      const minTemp = Math.min(...dayEntry.temps);

      const mainIcon = dayEntry.icons[0];

      let dayName: string;
      const dayDiff = Math.floor((dayEntry.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 0) {
        dayName = 'Hoje';
      } else if (dayDiff === 1) {
        dayName = 'Amanhã';
      } else {
        dayName = this.getDayName(dayEntry.date.getDay());
      }

      processedForecast.push({
        name: dayName,
        icon: mainIcon,
        maxTemp: maxTemp,
        minTemp: minTemp
      });
    }
    return processedForecast;
  }

  private getDayName(dayIndex: number): string {
    const days = ['Dom.', 'Seg.', 'Ter.', 'Quar.', 'Quin.', 'Sex.', 'Sáb.'];
    return days[dayIndex];
  }

  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom'
    });
    toast.present();
  }
}