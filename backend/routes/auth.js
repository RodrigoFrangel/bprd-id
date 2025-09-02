const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- ROTA DE REGISTRO ---
router.post('/register', async (req, res) => {
  // CORREÇÃO: Adicionado 'role' na desestruturação
  const { username, email, password, role } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'Este email já está em uso.' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ msg: 'Este nome de usuário já está em uso.' });
    }

    // CORREÇÃO: 'role' agora é passado ao criar o novo usuário
    const user = new User({ username, email, password, role });
    await user.save();

    // MELHORIA: Adicionado 'role' ao payload do token
    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 }, // Expira em 10 horas
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

// --- ROTA DE LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // MELHORIA: Adicionado 'role' ao payload do token
    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

module.exports = router;
