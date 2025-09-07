// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Character = require('./models/Character'); // Importe o modelo de Character aqui

// Este servidor é APENAS para o WebSocket do mapa/combate.
// A API REST principal é servida pela Vercel.
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- Socket.IO ---
io.on('connection', (socket) => {
  console.log('a user connected to combat server');

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

  // Evento para quando o mestre troca a imagem de fundo do mapa
  socket.on('dm-change-map', (data) => {
    if (data.room && data.mapUrl) {
      io.in(data.room).emit('map-changed', { mapUrl: data.mapUrl });
    }
  });

  // Evento para quando o mestre exibe ou oculta um token
  socket.on('dm-toggle-token-visibility', async ({ characterId, isVisible, room }) => {
    try {
      await Character.findByIdAndUpdate(characterId, { isVisibleOnMap: isVisible });
      io.in(room).emit('token-visibility-changed', { characterId, isVisible });
    } catch (err) {
      console.error('Erro ao atualizar visibilidade do token:', err);
      socket.emit('error-message', { message: 'Não foi possível atualizar o token.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected from combat server');
  });
});

const PORT = process.env.PORT || 7001; // Usar uma porta diferente para evitar conflitos

// --- Função para conectar ao DB e iniciar o servidor ---
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Servidor de combate conectado ao MongoDB com sucesso!");
    server.listen(PORT, () => console.log(`Servidor de combate rodando na porta ${PORT}`));
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

start();
