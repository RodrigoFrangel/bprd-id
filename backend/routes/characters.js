const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware de autenticação
const Character = require('../models/Character');

// --- CRIAR UM PERSONAGEM ---
// @route   POST api/characters
// @desc    Cria um novo personagem
// @access  Privado (precisa de token)
router.post('/', auth, async (req, res) => {
  try {
    const newCharacter = new Character({
      ...req.body,
      userId: req.user.id, // Associa o personagem ao usuário logado
    });

    const character = await newCharacter.save();
    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

// --- BUSCAR PERSONAGENS DO USUÁRIO LOGADO ---
// @route   GET api/characters/mine
// @desc    Busca todos os personagens do usuário
// @access  Privado
router.get('/mine', auth, async (req, res) => {
  try {
    const characters = await Character.find({ userId: req.user.id })
      .populate('userId', 'username') 
      .sort({ createdAt: -1 });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

// --- BUSCAR PERSONAGENS PÚBLICOS ---
// @route   GET api/characters/public
// @desc    Busca todos os personagens públicos
// @access  Público
router.get('/public', async (req, res) => {
  try {
    const characters = await Character.find({ isPublic: true })
      .populate('userId', 'username') 
      .sort({ createdAt: -1 });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

// --- ATUALIZAR UM PERSONAGEM ---
// @route   PUT api/characters/:id
// @desc    Atualiza um personagem
// @access  Privado
router.put('/:id', auth, async (req, res) => {
  try {
    let character = await Character.findById(req.params.id);

    if (!character) return res.status(404).json({ msg: 'Personagem não encontrado.' });

    // Garante que o usuário só pode editar o próprio personagem
    if (character.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado.' });
    }

    character = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

// --- DELETAR UM PERSONAGEM ---
// @route   DELETE api/characters/:id
// @desc    Deleta um personagem
// @access  Privado
router.delete('/:id', auth, async (req, res) => {
  try {
    let character = await Character.findById(req.params.id);

    if (!character) return res.status(404).json({ msg: 'Personagem não encontrado.' });

    // Garante que o usuário só pode deletar o próprio personagem
    if (character.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado.' });
    }

    await Character.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Personagem removido.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

module.exports = router;
