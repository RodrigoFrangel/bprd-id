const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Para não retornar a senha em consultas
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hook que é executado ANTES de um documento 'User' ser salvo
UserSchema.pre('save', async function (next) {
  // Criptografa a senha usando bcrypt
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
