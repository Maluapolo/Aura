// backend/services/weatherApi.js

const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
// Base URL para o clima atual
const CURRENT_WEATHER_BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';
// Base URL para a previsão de 5 dias / 3 horas
const FORECAST_BASE_URL = 'http://api.openweathermap.org/data/2.5/forecast';

console.log('Chave da API OpenWeatherMap sendo usada:', OPENWEATHER_API_KEY); // Manter para depuração

// Função para obter a previsão do tempo por nome da cidade (clima atual)
async function getWeatherByCity(city) {
    try {
        const response = await axios.get(CURRENT_WEATHER_BASE_URL, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric', // Retorna Celsius
                lang: 'pt_br' // Idioma dos resultados
            }
        });
        console.log('Dados brutos do OpenWeatherMap (cidade - clima atual):', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao chamar a API OpenWeatherMap (clima atual):', error.response ? error.response.data : error.message);
        throw new Error('Falha ao buscar dados de previsão do tempo (clima atual).');
    }
}

// NOVO: Função para obter a previsão de 5 dias por nome da cidade
async function getForecastByCity(city) {
    try {
        const response = await axios.get(FORECAST_BASE_URL, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric', // Retorna Celsius
                lang: 'pt_br', // Idioma dos resultados
                cnt: 24 // Opcional: obter 8 * 3 = 24 dados de 3 em 3 horas (para 3 dias, se disponível)
                        // A API padrão já retorna 40 entradas (5 dias * 8 períodos de 3h), mas cnt pode limitar.
                        // Para 3 dias completos (72 horas), precisaríamos de 24 entradas (24 * 3h = 72h).
            }
        });
        console.log('Dados brutos do OpenWeatherMap (previsão):', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao chamar a API OpenWeatherMap (previsão):', error.response ? error.response.data : error.message);
        throw new Error('Falha ao buscar dados de previsão do tempo (previsão).');
    }
}

// Função para obter a previsão do tempo por coordenadas (manter como está)
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await axios.get(CURRENT_WEATHER_BASE_URL, { // Note: usando CURRENT_WEATHER_BASE_URL aqui
            params: {
                lat: lat,
                lon: lon,
                appid: OPENWEATHER_API_KEY,
                units: 'metric',
                lang: 'pt_br'
            }
        });
        console.log('Dados brutos do OpenWeatherMap (coordenadas):', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao chamar a API OpenWeatherMap (coordenadas):', error.response ? error.response.data : error.message);
        throw new Error('Falha ao buscar dados de previsão do tempo por coordenadas.');
    }
}


module.exports = {
    getWeatherByCity,
    getForecastByCity, // EXPOR A NOVA FUNÇÃO
    getWeatherByCoords
};