// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- Middlewares ---
// Habilita CORS para todas as origens
app.use(cors()); 

// Adiciona um middleware para lidar com requisições OPTIONS (preflight)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Middleware para injetar o 'io' nas requisições
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- Rotas da API ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));

// --- Socket.IO ---
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('move-token', (data) => {
    // Salva a posição no banco de dados
    // (A lógica de salvar foi movida para cá para garantir que a emissão ocorra após o salvamento)
    const Character = require('./models/Character');
    Character.findByIdAndUpdate(
        data.characterId,
        { $set: { positionX: data.positionX, positionY: data.positionY } },
        { new: true }
    ).then(updatedCharacter => {
        // Emite a atualização para todos os outros clientes
        socket.broadcast.emit('update-token', data);
    }).catch(err => {
        console.error('Erro ao salvar posição do token:', err);
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 7000;

// --- Função para conectar ao DB e iniciar o servidor ---
const start = async () => {
  try {
    // 1. Tenta conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado ao MongoDB com sucesso!");

    // 2. Se a conexão for bem-sucedida, inicia o servidor
    server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (error) {
    // 3. Se a conexão falhar, mostra o erro
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1); // Encerra o processo com falha
  }
};

// --- Inicia tudo ---
start();