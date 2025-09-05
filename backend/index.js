// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Character = require('./models/Character'); // Importe o modelo de Character aqui

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rotas da API...
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));
app.use('/api/combat', require('./routes/combat'));

// --- Socket.IO ---
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-map-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('move-token', (data) => {
    Character.findByIdAndUpdate(
        data.characterId,
        { $set: { positionX: data.positionX, positionY: data.positionY } },
        { new: true }
    ).then(() => {
        if (data.room) {
            socket.broadcast.to(data.room).emit('update-token', data);
        }
    }).catch(err => {
        console.error('Erro ao salvar posição do token:', err);
    });
  });

  // >>> NOVOS EVENTOS DE MESTRE ADICIONADOS <<<

  // Evento para quando o mestre troca a imagem de fundo do mapa
  socket.on('dm-change-map', (data) => {
    // Re-transmite a nova URL para TODOS os clientes (incluindo o mestre) na sala
    if (data.room && data.mapUrl) {
      io.in(data.room).emit('map-changed', { mapUrl: data.mapUrl });
    }
  });

  // Evento para quando o mestre exibe ou oculta um token
  socket.on('dm-toggle-token-visibility', async ({ characterId, isVisible, room }) => {
    try {
      // 1. Atualiza o status do personagem no banco de dados
      await Character.findByIdAndUpdate(characterId, { isVisibleOnMap: isVisible });
      
      // 2. Avisa todos os clientes na sala sobre a mudança de visibilidade
      io.in(room).emit('token-visibility-changed', { characterId, isVisible });

    } catch (err) {
      console.error('Erro ao atualizar visibilidade do token:', err);
      // Opcional: emitir uma mensagem de erro de volta para o mestre
      socket.emit('error-message', { message: 'Não foi possível atualizar o token.' });
    }
  });


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 7000;

// --- Função para conectar ao DB e iniciar o servidor ---
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado ao MongoDB com sucesso!");
    server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

start();
