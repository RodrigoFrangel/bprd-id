const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const auth = require('../middleware/auth');

// @route   GET api/combat/main-characters
// @desc    Get all main characters for combat
// @access  Private
router.get('/main-characters', auth, async (req, res) => {
  try {
    const characters = await Character.find({ isMainCharacter: true })
      .populate('userId', 'username')
      .sort({ initiative: -1 });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/combat/initiative/:id
// @desc    Update character initiative
// @access  Private
router.put('/initiative/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }

    if (character.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
    }

    character.initiative = req.body.initiative;
    await character.save();

    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/combat/hp/:id
// @desc    Update character HP
// @access  Private
router.put('/hp/:id', auth, async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);

        if (!character) {
            return res.status(404).json({ msg: 'Character not found' });
        }

        if (character.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        character.currentHP = req.body.currentHP;
        await character.save();

        res.json(character);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/combat/end-turn
// @desc    End current turn and set next turn
// @access  Private
router.put('/end-turn', auth, async (req, res) => {
  try {
    const characters = await Character.find({ isMainCharacter: true }).sort({ initiative: -1 });
    const currentTurnCharacter = characters.find(c => c.isTurn);

    if (currentTurnCharacter) {
      // Lógica corrigida: removida a verificação de dono para permitir que qualquer um encerre o turno.
      currentTurnCharacter.isTurn = false;
      await currentTurnCharacter.save();

      const currentTurnIndex = characters.findIndex(c => c.id === currentTurnCharacter.id);
      const nextTurnIndex = (currentTurnIndex + 1) % characters.length;
      const nextTurnCharacter = characters[nextTurnIndex];

      nextTurnCharacter.isTurn = true;
      await nextTurnCharacter.save();
    } else if (characters.length > 0) {
      // Se ninguém tiver o turno, define o primeiro personagem como o turno atual
      characters[0].isTurn = true;
      await characters[0].save();
    }

    // Retorna a lista atualizada para o frontend poder redesenhar
    const updatedCharacters = await Character.find({ isMainCharacter: true })
        .populate('userId', 'username')
        .sort({ initiative: -1 });

    res.json(updatedCharacters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

