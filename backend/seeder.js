const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Character = require('./models/Character');

// Carrega as variáveis de ambiente
dotenv.config();

// Conecta ao banco de dados
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectado para o seeder...');
  } catch (err) {
    console.error(`Erro no seeder: ${err.message}`);
    process.exit(1);
  }
};

// --- DADOS DE EXEMPLO ---
// Usuário de exemplo que será o dono do personagem
const seedUser = {
  email: 'gaylord.focker@bprd.com',
  password: 'password123', // A senha será criptografada pelo Mongoose
};

// Seu personagem, adaptado para o Mongoose
const seedCharacter = {
  isPublic: true,
  name: "Gaylord",
  age: "00",
  height: "00",
  weight: "00",
  role: "Engenheiro Experimental",
  department: "Pesquisa & Desenvolvimento",
  level: "5",
  profilePic: "https://i.postimg.cc/mg0zmcNw/gaylord-profile.png",
  origin: "Humano Verdadeiramente Excepcional",
  recruitment: "Passou da Linha",
  lifeBefore: "Profissional",
  drive: "Achar alguém ou algo melhor que ele",
  psych: [
    "Narcisismo Estrutural",
    "Propenso a Crises Existenciais",
    "Impulso para Autossabotagem & Caos"
  ],
  attributes: {
    str: 8,
    con: 6,
    dex: 4,
    int: 22,
    wis: 12,
    cha: 22
  }
};


// --- FUNÇÕES DO SEEDER ---

// Função para IMPORTAR os dados
const importData = async () => {
  try {
    // 1. Limpa o banco de dados para evitar duplicatas
    await User.deleteMany();
    await Character.deleteMany();

    // 2. Cria o usuário de exemplo
    const createdUser = await User.create(seedUser);
    console.log('Usuário de exemplo criado:', createdUser.email);

    // 3. Pega o ID do usuário criado e o adiciona ao personagem
    const characterWithOwner = {
      ...seedCharacter,
      userId: createdUser._id // Associa o personagem ao usuário
    };

    // 4. Cria o personagem no banco de dados
    await Character.create(characterWithOwner);
    console.log('Personagem "Gaylord" importado com sucesso!');

    process.exit();
  } catch (error) {
    console.error(`Erro ao importar dados: ${error}`);
    process.exit(1);
  }
};

// Função para DESTRUIR todos os dados
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Character.deleteMany();
    console.log('Dados destruídos com sucesso!');
    process.exit();
  } catch (error) {
    console.error(`Erro ao destruir dados: ${error}`);
    process.exit(1);
  }
};

// --- LÓGICA PARA RODAR O SCRIPT ---
const runSeeder = async () => {
  await connectDB();

  // Verifica o argumento passado na linha de comando
  if (process.argv[2] === '-d') {
    await destroyData();
  } else {
    await importData();
  }
};

runSeeder();
