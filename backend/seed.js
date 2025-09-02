const mongoose = require('mongoose');
const User = require('./models/User'); // Ajuste o caminho se necessário
const Character = require('./models/Character'); // Ajuste o caminho se necessário
const Campaign = require('./models/Campaign'); // Ajuste o caminho se necessário
const bcrypt = require('bcryptjs');

// --- DADOS MOCK ---
// Apenas NPCs do Mestre serão criados no seed
const MOCK_NPCS = [
    {
        name: 'Cultista das Sombras',
        role: 'Ladino',
        level: '3',
        attributes: { str: 10, dex: 16, con: 10, int: 12, wis: 8, cha: 14 },
        isNpc: true
    },
    {
        name: 'Aberração Tentacular',
        role: 'Monstro',
        level: '6',
        attributes: { str: 18, dex: 8, con: 20, int: 6, wis: 10, cha: 4 },
        isNpc: true
    }
];

// --- FUNÇÃO DE SEED ---

const seedDatabase = async () => {
    try {
        console.log('Limpando o banco de dados...');
        await User.deleteMany({});
        await Character.deleteMany({});
        await Campaign.deleteMany({});

        console.log('Criando usuários...');
        const createdUsers = await User.insertMany(MOCK_USERS.map(user => {
            user.password = bcrypt.hashSync(user.password, 10);
            return user;
        }));
        
        const dm = createdUsers.find(u => u.role === 'DM');

        console.log('Criando NPCs para o Mestre...');
        const cultistData = { ...MOCK_NPCS[0], userId: dm._id, isPublic: false };
        const aberrationData = { ...MOCK_NPCS[1], userId: dm._id, isPublic: false };

        await Character.insertMany([cultistData, aberrationData]);
        
        console.log('Criando campanha...');
        
        const campaignData = {
            name: 'A NOITE DO METEORO',
            masterId: dm._id,
            inviteCode: 'METEORO123',
            participants: [] // A campanha começa vazia. Os jogadores entrarão depois.
        };
        await Campaign.create(campaignData);

        console.log('Banco de dados populado com sucesso!');

    } catch (error) {
        console.error('Erro ao popular o banco de dados:', error);
    }
};


// --- CONEXÃO E EXECUÇÃO ---

const DB_URI = 'mongodb://localhost:27017/bprd-app'; // <-- COLOQUE SUA STRING DE CONEXÃO AQUI

mongoose.connect(DB_URI)
    .then(() => {
        console.log('Conectado ao MongoDB.');
        return seedDatabase();
    })
    .then(() => {
        console.log('Fechando conexão.');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Erro de conexão com o MongoDB:', err);
    });

