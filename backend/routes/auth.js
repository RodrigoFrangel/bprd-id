const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');


// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- ROTA DE REGISTRO ---
router.post('/register', async (req, res) => {
  // Usamos 'let' para poder modificar a 'role'
  let { username, email, password, role } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'Este email já está em uso.' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ msg: 'Este nome de usuário já está em uso.' });
    }
    
    // >>> LÓGICA DO ADMIN ADICIONADA <<<
    // Se o email for o do administrador, a 'role' é forçada para 'Admin'
    if (email.toLowerCase() === 'soumuitorodrigo@gmail.com') {
      role = 'Admin';
    }

    const user = new User({ username, email, password, role });
    await user.save();

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
