
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Character =require('./models/Character');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectado para o safe-seeder...');
  } catch (err) {
    console.error(`Erro no seeder: ${err.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // --- DADOS DO USUÁRIO ---
    const userData = {
      username: 'dev',
      email: 'dev@hotmail.com',
      password: '123456',
      role: 'Player',
    };

    // 1. Verifica se o usuário já existe para não criar duplicatas
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      user = await User.create(userData);
      console.log(`Usuário "${user.username}" criado com sucesso.`);
    } else {
      console.log(`Usuário "${user.username}" já existe. Pulando criação.`);
    }

    // --- DADOS DOS PERSONAGENS ---
    const charactersData = [
      {
        name: "Abe Sapien",
        role: "Investigador de Campo",
        department: "Pesquisa & Desenvolvimento",
        level: "4",
        origin: "Icthyo sapien",
        recruitment: "Encontrado em um tanque",
        attributes: { str: 12, con: 14, dex: 16, int: 18, wis: 16, cha: 10 },
        userId: user._id,
      },
      {
        name: "Liz Sherman",
        role: "Agente de Campo",
        department: "Operações Especiais",
        level: "6",
        origin: "Humana (Pirocinética)",
        recruitment: "Recrutada na infância",
        attributes: { str: 10, con: 12, dex: 14, int: 12, wis: 10, cha: 18 },
        userId: user._id,
      },
      {
        name: "Johann Kraus",
        role: "Consultor",
        department: "Pesquisa & Desenvolvimento",
        level: "5",
        origin: "Forma Ectoplásmica",
        recruitment: "Contido após um acidente",
        attributes: { str: 8, con: 10, dex: 12, int: 20, wis: 18, cha: 12 },
        userId: user._id,
      }
    ];

    // 2. Itera e cria apenas os personagens que não existem
    for (const charData of charactersData) {
      const characterExists = await Character.findOne({ name: charData.name, userId: user._id });
      if (!characterExists) {
        await Character.create(charData);
        console.log(`Personagem "${charData.name}" criado com sucesso.`);
      } else {
        console.log(`Personagem "${charData.name}" já existe. Pulando criação.`);
      }
    }

    console.log('Seeder seguro finalizado.');
    process.exit();

  } catch (error) {
    console.error(`Erro ao executar o seeder: ${error}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
};

run();
