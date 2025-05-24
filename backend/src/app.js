const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weather');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const app = express();
const port = process.env.PORT || 3000; // Usa a porta do .env ou 3000 por padrão

app.use(cors()); // Permite que o frontend acesse esta API
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

app.use('/api/weather', weatherRoutes); // Define a rota base para a API de clima

app.listen(port, () => {
    console.log(`🚀 Backend Aura rodando em http://localhost:${port}`);
});