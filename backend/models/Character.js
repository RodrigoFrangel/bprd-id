const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
  // Link para o usuário que criou o personagem
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false, // Por padrão, personagens são privados
  },
  // Todos os campos do seu formulário
  name: { type: String, required: true },
  age: { type: String },
  height: { type: String },
  weight: { type: String },
  role: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  profilePic: { type: String },
  origin: { type: String, required: true },
  recruitment: { type: String, required: true },
  lifeBefore: { type: String },
  drive: { type: String },
  psych: [{ type: String }], // Um array de strings

  // --- NOVOS CAMPOS ---
  hitPoints: { type: String }, // Ex: "10/10"
  features: [{
    name: { type: String },
    description: { type: String }
  }],
  // --------------------
  
  attributes: {
    str: { type: Number, required: true },
    con: { type: Number, required: true },
    dex: { type: Number, required: true },
    int: { type: Number, required: true },
    wis: { type: Number, required: true },
    cha: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Character = mongoose.model('Character', CharacterSchema);

module.exports = Character;