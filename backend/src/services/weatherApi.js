const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

// Função para obter a previsão do tempo por nome da cidade
async function getWeatherByCity(city) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric', // Use 'metric' para Celsius, 'imperial' para Fahrenheit
                lang: 'pt_br' // Idioma dos resultados
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao chamar a API OpenWeatherMap (cidade):', error.response ? error.response.data : error.message);
        throw new Error('Falha ao buscar dados de previsão do tempo.');
    }
}

// Função para obter a previsão do tempo por coordenadas
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                lat: lat,
                lon: lon,
                appid: OPENWEATHER_API_KEY,
                units: 'metric',
                lang: 'pt_br'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao chamar a API OpenWeatherMap (coordenadas):', error.response ? error.response.data : error.message);
        throw new Error('Falha ao buscar dados de previsão do tempo por coordenadas.');
    }
}

module.exports = {
    getWeatherByCity,
    getWeatherByCoords
};