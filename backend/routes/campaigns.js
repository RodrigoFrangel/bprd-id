const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Character = require('../models/Character');
const { v4: uuidv4 } = require('uuid');

// @route   POST api/campaigns
// @desc    Cria uma nova campanha
// @access  Privado (Mestres)
router.post('/', auth, async (req, res) => {
    // Garante que apenas Mestres podem criar campanhas
    if (req.user.role !== 'Mestre') {
        return res.status(403).json({ msg: 'Apenas Mestres podem criar campanhas.' });
    }

    const { name, participants } = req.body;

    try {
        const newCampaign = new Campaign({
            name,
            masterId: req.user.id,
            participants: participants || [],
            inviteCode: uuidv4().substr(0, 8).toUpperCase() // Gera um código de convite único
        });

        const campaign = await newCampaign.save();
        res.json(campaign);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});

// @route   GET api/campaigns/my-campaigns
// @desc    Busca as campanhas do usuário (como mestre ou jogador)
// @access  Privado
router.get('/my-campaigns', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.find({
            $or: [
                { masterId: req.user.id },
                { 'participants.userId': req.user.id }
            ]
        }).populate('masterId', 'username').sort({ createdAt: -1 });
        
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});

// @route   POST api/campaigns/join
// @desc    Entra em uma campanha com um código
// @access  Privado
router.post('/join', auth, async (req, res) => {
    const { inviteCode, characterId } = req.body;

    if (!characterId) {
        return res.status(400).json({ msg: 'Personagem principal não especificado.' });
    }

    try {
        const campaign = await Campaign.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!campaign) {
            return res.status(404).json({ msg: 'Campanha não encontrada com este código.' });
        }

        const character = await Character.findById(characterId);
        if (!character || character.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Personagem inválido ou não pertence a você.' });
        }

        // Verifica se o personagem já está na campanha
        if (campaign.participants.some(p => p.characterId.equals(characterId))) {
            return res.status(400).json({ msg: 'Este personagem já está na campanha.' });
        }
        
        // Adiciona o participante
        campaign.participants.push({
            characterId: characterId,
            userId: req.user.id
        });

        await campaign.save();
        res.json(campaign);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});


module.exports = router;
