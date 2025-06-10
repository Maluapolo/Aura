// frontend/src/app/pages/home/home.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth/auth.service';
import { WeatherService } from '../../services/weather/weather.service';
import { Geolocation } from '@capacitor/geolocation';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SearchService } from '../../services/search/search.service';

// Opcional: Interface para tipar os dados da previs\u00E3o di\u00E1ria
interface DailyForecast {
  name: string; // Ex: "Hoje", "Amanh\u00E3", "Sex."
  icon: string; // Ex: "04d"
  maxTemp: number;
  minTemp: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule // Mantenha RouterModule aqui
    // REMOVIDOS: ActivatedRoute e SearchService. Eles s\u00E3o injetados no construtor, n\u00E3o importados aqui.
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

  // Propriedade para o fundo din\u00E2mico
  dynamicBackground: string = 'linear-gradient(135deg, #87ceeb, #4682B4)'; // Cor inicial azul c\u00E9u claro (um gradiente para melhor visual)

  constructor(
    private authService: AuthService,
    private router: Router,
    private weatherService: WeatherService,
    private searchService: SearchService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentUserDisplayName = this.authService.getCurrentUserDisplayName();

    this.activatedRoute.queryParams.subscribe(params => {
      const cityFromHistory = params['city'];
      if (cityFromHistory && cityFromHistory !== this.city) {
        this.city = cityFromHistory;
        this.getWeatherByCity(); // Busca o clima para a cidade do hist\u00F3rico
      } else if (!this.city) {
        // Opcional: Carregar clima da localiza\u00E7\u00E3o atual ao iniciar, se a cidade n\u00E3o estiver definida
        // this.getWeatherByCurrentLocation();
      }
    });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }

  async getWeatherByCity() {
    if (!this.city) {
      console.warn('Por favor, digite o nome da cidade.');
      return;
    }

    this.isLoadingWeather = true;
    this.weatherError = null;
    this.weatherData = null;
    this.forecastData = null;
    this.dynamicBackground = 'linear-gradient(135deg, #1c2a38, #3a4b5d)'; // Fundo escuro tempor\u00E1rio durante o carregamento

    try {
      this.weatherService.getWeatherByCity(this.city).subscribe({
        next: (data) => {
          this.weatherData = data;
          this.isLoadingWeather = false;
          this.dynamicBackground = this.getWeatherBackground(this.weatherData.weather[0].main, this.weatherData.main.temp);
          this.getForecastData(this.city);
          this.searchService.addSearchToHistory(this.city);
          this.searchService.incrementPopularCity(this.city);
        },
        error: (err) => {
          console.error('Erro ao buscar clima atual:', err);
          this.weatherError = 'N\u00E3o foi poss\u00EDvel obter os dados do clima atual. Tente novamente.';
          this.isLoadingWeather = false;
          this.forecastData = null;
          this.dynamicBackground = 'linear-gradient(135deg, #4b0000, #8b0000)'; // Fundo de erro
        }
      });
    } catch (error) {
      console.error('Erro inesperado ao iniciar busca de clima:', error);
      this.weatherError = 'Ocorreu um erro inesperado. Tente novamente.';
      this.isLoadingWeather = false;
      this.dynamicBackground = 'linear-gradient(135deg, #4b0000, #8b0000)'; // Fundo de erro
    }
  }

  async getWeatherByCurrentLocation() {
    this.isLoadingWeather = true;
    this.weatherError = null;
    this.weatherData = null;
    this.forecastData = null;
    this.dynamicBackground = 'linear-gradient(135deg, #1c2a38, #3a4b5d)'; // Fundo escuro tempor\u00E1rio durante o carregamento


    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const lat = coordinates.coords.latitude;
      const lon = coordinates.coords.longitude;

      this.weatherService.getWeatherByCoords(lat, lon).subscribe({
        next: (data) => {
          this.weatherData = data;
          this.isLoadingWeather = false;
          this.city = data.name;
          this.dynamicBackground = this.getWeatherBackground(this.weatherData.weather[0].main, this.weatherData.main.temp);
          this.getForecastData(this.city);
          this.searchService.addSearchToHistory(this.city);
          this.searchService.incrementPopularCity(this.city);
        },
        error: (err) => {
          console.error('Erro ao buscar clima por coordenadas:', err);
          this.weatherError = 'N\u00E3o foi poss\u00EDvel obter os dados de clima pela sua localiza\u00E7\u00E3o. Verifique as permiss\u00F5es.';
          this.isLoadingWeather = false;
          this.forecastData = null;
          this.dynamicBackground = 'linear-gradient(135deg, #4b0000, #8b0000)'; // Fundo de erro
        }
      });
    } catch (error) {
      console.error('Erro ao obter localiza\u00E7\u00E3o:', error);
      this.weatherError = 'N\u00E3o foi poss\u00EDvel obter sua localiza\u00E7\u00E3o. Verifique as permiss\u00F5es do dispositivo.';
      this.isLoadingWeather = false;
      this.dynamicBackground = 'linear-gradient(135deg, #4b0000, #8b0000)'; // Fundo de erro
    }
  }

  private getForecastData(city: string) {
    this.isLoadingForecast = true;
    this.forecastError = null;
    console.log('Chamando getWeatherForecastByCity para:', city);

    this.weatherService.getWeatherForecastByCity(city).subscribe({
      next: (data) => {
        console.log('Dados brutos da previs\u00E3o recebidos da API:', data);
        if (data && data.list) {
          this.forecastData = this.processForecastData(data.list);
          console.log('Previs\u00E3o processada (forecastData):', this.forecastData);
        } else {
          console.warn('Dados da previs\u00E3o vazios ou em formato inesperado:', data);
          this.forecastData = null;
        }
        this.isLoadingForecast = false;
      },
      error: (err) => {
        console.error('Erro ao buscar previs\u00E3o (subscribe error):', err);
        this.forecastError = 'N\u00E3o foi poss\u00EDvel obter a previs\u00E3o para os pr\u00F3ximos dias.';
        this.isLoadingForecast = false;
        this.forecastData = null;
      }
    });
  }

  private processForecastData(forecastList: any[]): DailyForecast[] {
    console.log('Iniciando processamento de forecastList:', forecastList);
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

    console.log('Chaves di\u00E1rias encontradas:', sortedKeys);
    console.log('N\u00FAmero de dias a processar (min(3, sortedKeys.length)):', Math.min(3, sortedKeys.length));

    for (let i = 0; i < Math.min(3, sortedKeys.length); i++) {
      const key = sortedKeys[i];
      const dayEntry = dailyData[key];
      const maxTemp = Math.max(...dayEntry.temps);
      const minTemp = Math.min(...dayEntry.temps);
      const mainIcon = dayEntry.icons[0];

      let dayName: string;
      const dayDiff = Math.floor((dayEntry.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 0) { dayName = 'Hoje'; }
      else if (dayDiff === 1) { dayName = 'Amanh\u00E3'; }
      else { dayName = this.getDayName(dayEntry.date.getDay()); }

      processedForecast.push({ name: dayName, icon: mainIcon, maxTemp: maxTemp, minTemp: minTemp });
    }
    console.log('Previs\u00E3o di\u00E1ria final processada:', processedForecast);
    return processedForecast;
  }

  private getDayName(dayIndex: number): string {
    const days = ['Dom.', 'Seg.', 'Ter.', 'Quar.', 'Quin.', 'Sex.', 'S\u00E1b.'];
    return days[dayIndex];
  }

  // Fun\u00E7\u00E3o para mapear condi\u00E7\u00F5es de clima e temperatura para URLs de imagem/cores
  private getWeatherBackground(weatherMain: string, temperature: number): string {
    let backgroundValue = '';

    // Mapeamento das condi\u00E7\u00F5es para IMAGENS LOCAIS
    // MANTER OS CAMINHOS EXATAMENTE COMO FORNECIDOS PELO USU\u00C1RIO.
    const imageMap: { [key: string]: string } = {
        // C\u00E9u Claro
        'clear-hot': 'assets/images/ceu_quente.jpg', // >28\u00B0C
        'clear-mild': 'assets/images/sol_ameno.jpg', // 20-28\u00B0C
        'clear-cold': 'assets/images/sol_frio.jpg', // <20\u00B0C

        // Nublado / Nuvens
        'clouds': 'assets/images/ceu_nublado.jpg', // Para qualquer n\u00EDvel de nuvens
        'overcast': 'assets/images/ceu_nublado.jpg', // Usando a mesma imagem para c\u00E9u mais encoberto se n\u00E3o houver outra espec\u00EDfica

        // Chuva / Chuvisco
        'rain': 'assets/images/ceu_chuvoso.jpg',
        'drizzle': 'assets/images/ceu_chuvoso.jpg', // Usando a mesma imagem de chuva para chuvisco

        // Tempestade
        'thunderstorm': 'assets/images/tempestade.webp',

        // Neve
        'snow': 'assets/images/neve.jpg',

        // Neblina / Nevoeiro (e condi\u00E7\u00F5es similares que s\u00E3o visuais)
        'mist': 'assets/images/neblina.jpg',
        'fog': 'assets/images/neblina.jpg',
        'haze': 'assets/images/nevoa_seca.jpg',

        // Outras condi\u00E7\u00F5es do OpenWeatherMap
        'smoke': 'assets/images/weather/smoky.jpg',
        'dust': 'assets/images/weather/dusty.jpg',
        'sand': 'assets/images/weather/sandy.jpg',
        'ash': 'assets/images/weather/ashy.jpg',
        'squall': 'assets/images/vento_forte.jpg',
        'tornado': 'assets/images/tornado.jpg'
    };


    const condition = weatherMain.toLowerCase();

    // L\u00F3gica para 'clear' baseada na temperatura
    if (condition === 'clear') {
        if (temperature > 28) {
            backgroundValue = imageMap['clear-hot'];
        } else if (temperature >= 20) {
            backgroundValue = imageMap['clear-mild'];
        } else { // Temperatura mais fria
            backgroundValue = imageMap['clear-cold'];
        }
    } else if (condition.includes('cloud')) { // Trata "Clouds", "Few clouds", "Scattered clouds", "Broken clouds", "Overcast clouds"
        backgroundValue = imageMap['clouds'];
    }
    else if (condition.includes('rain') || condition.includes('drizzle')) {
        backgroundValue = imageMap['rain'];
    }
    else if (condition.includes('thunderstorm')) {
        backgroundValue = imageMap['thunderstorm'];
    }
    else if (condition.includes('snow')) {
        backgroundValue = imageMap['snow'];
    }
    // Adicionado tratamento para neblina e similares explicitamente
    else if (condition.includes('mist') || condition.includes('fog')) {
        backgroundValue = imageMap['mist'];
    }
    else if (condition.includes('haze')) {
        backgroundValue = imageMap['haze'];
    }
    // Fallback para outras condi\u00E7\u00F5es n\u00E3o mapeadas
    else if (imageMap[condition]) {
        backgroundValue = imageMap[condition];
    }
    else {
        backgroundValue = imageMap['clouds'];
    }

    // Retorna a string completa para a propriedade 'background' do CSS
    return `url('${backgroundValue}') center center / cover no-repeat`;
  }

  // M\u00E9todo para navegar para a p\u00E1gina de hist\u00F3rico
  goToHistory() {
    this.router.navigateByUrl('/history');
  }
}
