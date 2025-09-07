const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Character = require('../models/Character');

// --- CRIAR UM PERSONAGEM ---
// @route   POST api/characters
// @desc    Cria um novo personagem
// @access  Privado (precisa de token)
router.post('/', auth, async (req, res) => {
  try {
    const characterData = { ...req.body };

    // Calcula a iniciativa com base na Destreza antes de salvar
    if (characterData.attributes && typeof characterData.attributes.dex === 'number') {
      const dexModifier = Math.floor((characterData.attributes.dex - 10) / 2);
      characterData.initiative = 10 + dexModifier;
    }

    const newCharacter = new Character({
      ...characterData,
      userId: req.user.id,
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

// --- BUSCAR PERSONAGENS PRINCIPAIS PARA COMBATE ---
// @route   GET api/characters/main
// @desc    Busca todos os personagens marcados como principais
// @access  Privado
router.get('/main', auth, async (req, res) => {
  try {
    const characters = await Character.find({ isMainCharacter: true })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});


// --- DEFINIR PERSONAGEM PRINCIPAL ---
// @route   PUT api/characters/set-main/:id
// @desc    Define ou desmarca um personagem como o principal do usuário
// @access  Privado
router.put('/set-main/:id', auth, async (req, res) => {
  try {
    const characterToSet = await Character.findById(req.params.id);

    if (!characterToSet || characterToSet.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Personagem não encontrado ou não autorizado.' });
    }

    const isCurrentlyMain = characterToSet.isMainCharacter;

    await Character.updateMany(
      { userId: req.user.id },
      { $set: { isMainCharacter: false } }
    );

    if (!isCurrentlyMain) {
      await Character.findByIdAndUpdate(
        req.params.id,
        { $set: { isMainCharacter: true } }
      );
    }

    res.json({ msg: 'Personagem principal atualizado com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

// --- BUSCAR UM PERSONAGEM ESPECÍFICO POR ID ---
// @route   GET api/characters/:id
// @desc    Busca um personagem pelo seu ID
// @access  Privado (dono ou Admin, ou se for público)
router.get('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id).populate('userId', 'username');

    if (!character) {
      return res.status(404).json({ msg: 'Personagem não encontrado.' });
    }

    // Se o personagem não for público, verifica a permissão
    if (!character.isPublic) {
      // Assegura que req.user existe antes de prosseguir
      if (!req.user) {
        return res.status(401).json({ msg: 'Token de autenticação não encontrado ou inválido.' });
      }
      const isOwner = character.userId._id.toString() === req.user.id;
      const isAdmin = req.user.role === 'Admin';

      if (!isOwner && !isAdmin) {
        return res.status(401).json({ msg: 'Não autorizado a ver este personagem.' });
      }
    }
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Personagem não encontrado (ID inválido).' });
    }
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

    // Apenas o dono do personagem ou um Admin pode editar
    if (character.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Não autorizado.' });
    }
    
    const updateData = { ...req.body };

    // Se a Destreza (dex) estiver sendo atualizada, recalcula a iniciativa
    if (updateData.attributes && typeof updateData.attributes.dex === 'number') {
      const dexModifier = Math.floor((updateData.attributes.dex - 10) / 2);
      updateData.initiative = 10 + dexModifier;
    }

    character = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
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

    // Apenas o dono do personagem ou um Admin pode deletar
    if (character.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Não autorizado.' });
    }

    await Character.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Personagem removido.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

module.exports = router;