const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Character = require('../models/Character');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET api/admin/users
// @desc    Obtém todos os utilizadores
// @access  Admin
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Atualiza a função (role) de um utilizador
// @access  Admin
router.put('/users/:id/role', [auth, adminAuth], async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ['Player', 'DM', 'Admin'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ msg: 'Função inválida.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'Utilizador não encontrado.' });
    }

    // Impede que o admin se remova a si mesmo da função de admin
    if (user.id.toString() === req.user.id && user.role === 'Admin' && role !== 'Admin') {
        return res.status(400).json({ msg: 'Não pode remover a sua própria permissão de administrador.'});
    }

    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});


// @route   DELETE api/admin/users/:id
// @desc    Elimina um utilizador e os seus personagens
// @access  Admin
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const userId = req.params.id;

        if (userId === req.user.id) {
            return res.status(400).json({ msg: 'Não se pode eliminar a si mesmo.' });
        }

        // Encontra e elimina o utilizador
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ msg: 'Utilizador não encontrado.' });
        }

        // Elimina todos os personagens associados a esse utilizador
        await Character.deleteMany({ userId: userId });

        res.json({ msg: 'Utilizador e todos os seus personagens foram eliminados.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// @route   GET api/admin/characters
// @desc    Obtém todos os personagens (para o admin)
// @access  Admin
router.get('/characters', [auth, adminAuth], async (req, res) => {
  try {
    const characters = await Character.find()
      .populate('userId', 'username')
      .sort({ name: 1 });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});


module.exports = router;
