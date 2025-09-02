const mongoose = require('mongoose');

// Define a estrutura para cada participante no combate
const CampaignParticipantSchema = new mongoose.Schema({
  characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initiativeResult: { type: Number, default: null },
  isNpc: { type: Boolean, default: false } // Para diferenciar NPCs controlados pelo mestre
}, { _id: false });

// Define a estrutura da Campanha/Combate
const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  masterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [CampaignParticipantSchema],
  currentTurnCharacterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', default: null },
  isActive: { type: Boolean, default: true },
  inviteCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Campaign = mongoose.model('Campaign', CampaignSchema);
module.exports = Campaign;
