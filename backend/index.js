// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rotas da API ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));

const PORT = process.env.PORT || 5000;

// --- Função para conectar ao DB e iniciar o servidor ---
const start = async () => {
  try {
    // 1. Tenta conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado ao MongoDB com sucesso!");

    // 2. Se a conexão for bem-sucedida, inicia o servidor
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (error) {
    // 3. Se a conexão falhar, mostra o erro
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1); // Encerra o processo com falha
  }
};

// --- Inicia tudo ---
start();