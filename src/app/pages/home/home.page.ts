// frontend/src/app/pages/home/home.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [
    CommonModule,
    FormsModule
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

  // Propriedade para o fundo dinâmico
  dynamicBackground: string = 'linear-gradient(135deg, #87ceeb, #4682B4)'; // Cor inicial azul céu claro (um gradiente para melhor visual)

  constructor(
    private authService: AuthService,
    private router: Router,
    private weatherService: WeatherService,
  ) {}

  ngOnInit() {
    this.currentUserDisplayName = this.authService.getCurrentUserDisplayName();
    // Você pode definir uma cidade padrão para carregar o clima ao iniciar
    // this.city = 'Rio de Janeiro';
    // this.getWeatherByCity(); // Comente ou descomente conforme a necessidade
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
    this.dynamicBackground = 'linear-gradient(135deg, #1c2a38, #3a4b5d)'; // Fundo escuro temporário durante o carregamento

    try {
      this.weatherService.getWeatherByCity(this.city).subscribe({
        next: (data) => {
          this.weatherData = data;
          this.isLoadingWeather = false;
          // Atualiza o background dinamicamente
          this.dynamicBackground = this.getWeatherBackground(this.weatherData.weather[0].main, this.weatherData.main.temp);
          this.getForecastData(this.city);
        },
        error: (err) => {
          console.error('Erro ao buscar clima atual:', err);
          this.weatherError = 'Não foi possível obter os dados do clima atual. Tente novamente.';
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
    this.dynamicBackground = 'linear-gradient(135deg, #1c2a38, #3a4b5d)'; // Fundo escuro temporário durante o carregamento


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
        },
        error: (err) => {
          console.error('Erro ao buscar clima por coordenadas:', err);
          this.weatherError = 'Não foi possível obter os dados de clima pela sua localização. Verifique as permissões.';
          this.isLoadingWeather = false;
          this.forecastData = null;
          this.dynamicBackground = 'linear-gradient(135deg, #4b0000, #8b0000)'; // Fundo de erro
        }
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      this.weatherError = 'Não foi possível obter sua localização. Verifique as permissões do dispositivo.';
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
        console.log('Dados brutos da previsão recebidos da API:', data);
        if (data && data.list) {
          this.forecastData = this.processForecastData(data.list);
          console.log('Previsão processada (forecastData):', this.forecastData);
        } else {
          console.warn('Dados da previsão vazios ou em formato inesperado:', data);
          this.forecastData = null;
        }
        this.isLoadingForecast = false;
      },
      error: (err) => {
        console.error('Erro ao buscar previsão (subscribe error):', err);
        this.forecastError = 'Não foi possível obter a previsão para os próximos dias.';
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

    console.log('Chaves diárias encontradas:', sortedKeys);
    console.log('Número de dias a processar (min(3, sortedKeys.length)):', Math.min(3, sortedKeys.length));

    for (let i = 0; i < Math.min(3, sortedKeys.length); i++) {
      const key = sortedKeys[i];
      const dayEntry = dailyData[key];
      const maxTemp = Math.max(...dayEntry.temps);
      const minTemp = Math.min(...dayEntry.temps);
      const mainIcon = dayEntry.icons[0];

      let dayName: string;
      const dayDiff = Math.floor((dayEntry.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 0) { dayName = 'Hoje'; }
      else if (dayDiff === 1) { dayName = 'Amanhã'; }
      else { dayName = this.getDayName(dayEntry.date.getDay()); }

      processedForecast.push({ name: dayName, icon: mainIcon, maxTemp: maxTemp, minTemp: minTemp });
    }
    console.log('Previsão diária final processada:', processedForecast);
    return processedForecast;
  }

  private getDayName(dayIndex: number): string {
    const days = ['Dom.', 'Seg.', 'Ter.', 'Quar.', 'Quin.', 'Sex.', 'Sáb.'];
    return days[dayIndex];
  }

  // Função para mapear condições de clima e temperatura para URLs de imagem/cores
  private getWeatherBackground(weatherMain: string, temperature: number): string {
    let backgroundValue = '';

    // Mapeamento das condições para IMAGENS LOCAIS (assets/images/weather/)
    // Certifique-se de que estes nomes de arquivo correspondem exatamente aos arquivos que você baixou
    const imageMap: { [key: string]: string } = {
        // Céu Claro
        'clear-hot': 'assets/images/ceu_quente.jpg', // >28°C (você forneceu este!)
        'clear-mild': 'assets/images/sol_ameno.jpg', // 20-28°C (você forneceu este!)
        'clear-cold': 'assets/images/sol_frio.jpg', // <20°C (você forneceu este!)

        // Nublado / Nuvens
        'clouds': 'assets/images/ceu_nublado.jpg', // Para qualquer nível de nuvens (você forneceu 'ceu-nebuloso.jpg')
        'overcast': 'assets/images/ceu_nublado.jpg', // Usando a mesma imagem para céu mais encoberto se não houver outra específica

        // Chuva / Chuvisco
        'rain': 'assets/images/ceu_chuvoso.jpg', // (você forneceu este!)
        'drizzle': 'assets/images/ceu_chuvoso.jpg', // Usando a mesma imagem de chuva para chuvisco

        // Tempestade (com base em 'tempestade.jpg')
        'thunderstorm': 'assets/images/tempestade.webp', // (você forneceu este!)

        // Neve (com base em 'neve.jpg')
        'snow': 'assets/images/neve.jpg', // (você forneceu este!)

        // Neblina / Nevoeiro (e condições similares que são visuais)
        'mist': 'assets/images/neblina.jpg', // (você forneceu este como 'nevoa_seca.jpg', vou usar o nome mais genérico aqui para o código)
        'fog': 'assets/images/neblina.jpg', // Usando a mesma da neblina
        'haze': 'assets/images/nevoa_seca.jpg', // Você tem 'nevoa_seca.jpg' para este!

        // Outras condições do OpenWeatherMap
        'smoke': 'assets/images/weather/smoky.jpg', // (placeholder)
        'dust': 'assets/images/weather/dusty.jpg', // (placeholder)
        'sand': 'assets/images/weather/sandy.jpg', // (placeholder)
        'ash': 'assets/images/weather/ashy.jpg', // (placeholder)
        'squall': 'assets/images/vento_forte.jpg', // (você forneceu este!)
        'tornado': 'assets/images/tornado.jpg' // (você forneceu este!)
    };


    const condition = weatherMain.toLowerCase();

    // Lógica para 'clear' baseada na temperatura
    if (condition === 'clear') {
        if (temperature > 28) {
            backgroundValue = imageMap['clear-hot'];
        } else if (temperature >= 20) {
            backgroundValue = imageMap['clear-mild'];
        } else { // Temperatura mais fria
            backgroundValue = imageMap['clear-cold'];
        }
    } else if (condition.includes('cloud')) { // Trata "Clouds", "Few clouds", "Scattered clouds", "Broken clouds", "Overcast clouds"
        backgroundValue = imageMap['clouds']; // Imagem específica para nublado (ceu-nebuloso.jpg)
    }
    else if (condition.includes('rain') || condition.includes('drizzle')) {
        backgroundValue = imageMap['rain']; // Imagem para chuva (ceu_chuvoso.jpg)
    }
    else if (condition.includes('thunderstorm')) {
        backgroundValue = imageMap['thunderstorm']; // Imagem para tempestade (tempestade.jpg)
    }
    else if (condition.includes('snow')) {
        backgroundValue = imageMap['snow']; // Imagem para neve (neve.jpg)
    }
    // Adicionado tratamento para neblina e similares explicitamente
    else if (condition.includes('mist') || condition.includes('fog')) { // Mist e Fog usam 'neblina.jpg'
        backgroundValue = imageMap['mist'];
    }
    else if (condition.includes('haze')) { // Haze usa 'nevoa_seca.jpg'
        backgroundValue = imageMap['haze'];
    }
    // Fallback para outras condições não mapeadas
    else if (imageMap[condition]) { // Se houver um mapeamento exato que não foi pego acima
        backgroundValue = imageMap[condition];
    }
    else {
        backgroundValue = imageMap['clouds']; // Fallback padrão: imagem de nublado se a condição não for reconhecida
    }

    // Retorna a string completa para a propriedade 'background' do CSS
    return `url('${backgroundValue}') center center / cover no-repeat`;
  }
}