const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- ROTA DE REGISTRO ---
// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Usuário já existe.' });
    }

    user = new User({ email, password });
    await user.save();

    // Cria o payload para o token
    const payload = { user: { id: user.id } };

    // Gera e retorna o token
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
// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Procura o usuário e inclui a senha na busca
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // Compara a senha enviada com a senha criptografada no banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    const payload = { user: { id: user.id } };

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
