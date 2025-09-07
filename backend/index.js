// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Conexão com o MongoDB ---
// É importante conectar ao DB aqui para que as rotas possam usar o Mongoose.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("API conectada ao MongoDB com sucesso!"))
  .catch(err => console.error("Erro ao conectar a API ao MongoDB:", err));


// Middlewares...
app.use(cors()); 
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());

// Rotas da API...
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));
app.use('/api/combat', require('./routes/combat'));
app.use('/api/admin', require('./routes/admin'));


// A Vercel precisa que a gente exporte o app do Express.
// Ela vai gerenciar o servidor por conta própria.
module.exports = app;
