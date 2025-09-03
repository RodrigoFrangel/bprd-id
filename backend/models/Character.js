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
    default: false,
  },
  npc: {
    type: Boolean,
    default: false,
  },
  isMainCharacter: {
    type: Boolean,
    default: false,
  },
  // Dados Básicos
  name: { type: String, required: true },
  age: { type: String },
  height: { type: String },
  weight: { type: String },
  role: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  profilePic: { type: String },
  hitPoints: { type: String }, // Ex: "12/12"
  
  // Classificação
  origin: { type: String, required: true },
  recruitment: { type: String, required: true },
  lifeBefore: { type: String },
  drive: { type: String },
  psych: [{ type: String }],
  
  // Atributos
  attributes: {
    str: { type: Number, required: true },
    con: { type: Number, required: true },
    dex: { type: Number, required: true },
    int: { type: Number, required: true },
    wis: { type: Number, required: true },
    cha: { type: Number, required: true },
  },
  
  savingThrowProficiencies: [{ type: String }],

  // Habilidades
  features: [{
    name: { type: String },
    description: { type: String },
    tag: { type: String }
  }],

  // Perícias
  skills: [{
      name: { type: String },
      proficient: { type: Boolean },
      advState: { type: String, default: null } // Can be 'advantage', 'disadvantage', or null
  }],

  // Ataques
  attacks: [{
      name: { type: String },
      bonus: { type: String },
      damage: { type: String },
      hasAmmo: { type: Boolean, default: false },
      currentAmmo: { type: String, default: "" }
  }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Character = mongoose.model('Character', CharacterSchema);

module.exports = Character;
