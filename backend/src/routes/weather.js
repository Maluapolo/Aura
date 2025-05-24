const express = require('express');
const router = express.Router();
const weatherApiService = require('../services/weatherApi');

// Rota para obter a previsão do tempo por cidade
router.get('/:city', async (req, res) => {
    try {
        const city = req.params.city;
        if (!city) {
            return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
        }
        const weatherData = await weatherApiService.getWeatherByCity(city);
        res.json(weatherData);
    } catch (error) {
        console.error('Erro ao buscar previsão do tempo:', error.message);
        res.status(500).json({ error: 'Não foi possível obter os dados da previsão do tempo.' });
    }
});

// Rota para obter a previsão do tempo pela localização (latitude e longitude)
router.get('/coords/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude e longitude são obrigatórias.' });
        }
        const weatherData = await weatherApiService.getWeatherByCoords(lat, lon);
        res.json(weatherData);
    } catch (error) {
        console.error('Erro ao buscar previsão do tempo por coordenadas:', error.message);
        res.status(500).json({ error: 'Não foi possível obter os dados da previsão do tempo por coordenadas.' });
    }
});

module.exports = router;