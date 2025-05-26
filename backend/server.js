require('dotenv').config();

const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weather');


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);

app.listen(port, () => {
    console.log(`🚀 Backend Aura rodando em http://localhost:${port}`);
});